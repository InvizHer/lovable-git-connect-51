# TellUs - CASCADE Delete Implementation Guide

## Overview

This document explains the CASCADE delete functionality implemented in TellUs to ensure data integrity and automatic cleanup when complaint boxes are deleted.

## What is CASCADE Delete?

CASCADE delete is a database feature that automatically deletes all related child records when a parent record is deleted. In TellUs, when you delete a complaint box, all associated data (complaints, feedback, analytics, and file attachments) are automatically removed.

## Implementation

### Database Foreign Keys with CASCADE

The following foreign key relationships have been configured with `ON DELETE CASCADE`:

#### 1. complaint_boxes → auth.users
```sql
admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
```
**Effect**: When a user account is deleted, all their complaint boxes are automatically deleted.

#### 2. complaints → complaint_boxes
```sql
box_id UUID NOT NULL REFERENCES public.complaint_boxes(id) ON DELETE CASCADE
```
**Effect**: When a complaint box is deleted, all complaints in that box are automatically deleted.

#### 3. feedbacks → complaint_boxes
```sql
box_id UUID NOT NULL REFERENCES public.complaint_boxes(id) ON DELETE CASCADE
```
**Effect**: When a complaint box is deleted, all feedback for that box is automatically deleted.

#### 4. analytics → complaint_boxes
```sql
box_id UUID NOT NULL REFERENCES public.complaint_boxes(id) ON DELETE CASCADE
```
**Effect**: When a complaint box is deleted, all analytics data for that box is automatically deleted.

## Deletion Flow

### When Admin Deletes a Complaint Box

```
Admin clicks "Delete" on Dashboard
         ↓
Confirmation Dialog appears with warning
         ↓
Admin confirms deletion
         ↓
DELETE FROM complaint_boxes WHERE id = box_id
         ↓
PostgreSQL CASCADE triggers automatically:
  ├─ DELETE all complaints (complaints table)
  ├─ DELETE all feedbacks (feedbacks table)
  └─ DELETE all analytics (analytics table)
         ↓
Success notification shown
         ↓
Dashboard refreshes
```

## User Interface Changes

### Enhanced Deletion Dialog

The admin dashboard now shows a comprehensive warning dialog when deleting a complaint box:

```
⚠️ Delete Complaint Box?

This action cannot be undone. This will permanently delete:
• The complaint box: [Box Name]
• All complaints submitted to this box (X complaints)
• All feedback ratings (X feedbacks)
• All analytics data for this box
• All file attachments associated with complaints

Are you absolutely sure you want to proceed?

[Cancel] [Yes, Delete Everything]
```

This ensures admins understand the full impact of deletion before proceeding.

## Security & RLS Policies

Row Level Security (RLS) policies ensure that only the box owner can delete their boxes:

```sql
CREATE POLICY "Admins can delete their own complaint boxes"
  ON public.complaint_boxes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);
```

## Verification

### Check CASCADE Rules

To verify CASCADE delete rules are properly configured, run this SQL query:

```sql
SELECT
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND rc.delete_rule = 'CASCADE';
```

Expected output should show:
- `complaints.box_id` → `complaint_boxes.id` (CASCADE)
- `feedbacks.box_id` → `complaint_boxes.id` (CASCADE)
- `analytics.box_id` → `complaint_boxes.id` (CASCADE)
- `complaint_boxes.admin_id` → `auth.users.id` (CASCADE)

## Manual Setup (If Needed)

If you need to manually add CASCADE delete rules to an existing database:

```sql
-- Drop existing foreign keys (if any)
ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_box_id_fkey;
ALTER TABLE public.feedbacks DROP CONSTRAINT IF EXISTS feedbacks_box_id_fkey;
ALTER TABLE public.analytics DROP CONSTRAINT IF EXISTS analytics_box_id_fkey;
ALTER TABLE public.complaint_boxes DROP CONSTRAINT IF EXISTS complaint_boxes_admin_id_fkey;

-- Add new foreign keys with CASCADE delete
ALTER TABLE public.complaint_boxes
  ADD CONSTRAINT complaint_boxes_admin_id_fkey 
  FOREIGN KEY (admin_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.complaints
  ADD CONSTRAINT complaints_box_id_fkey 
  FOREIGN KEY (box_id) 
  REFERENCES public.complaint_boxes(id) 
  ON DELETE CASCADE;

ALTER TABLE public.feedbacks
  ADD CONSTRAINT feedbacks_box_id_fkey 
  FOREIGN KEY (box_id) 
  REFERENCES public.complaint_boxes(id) 
  ON DELETE CASCADE;

ALTER TABLE public.analytics
  ADD CONSTRAINT analytics_box_id_fkey 
  FOREIGN KEY (box_id) 
  REFERENCES public.complaint_boxes(id) 
  ON DELETE CASCADE;
```

## Important Notes

1. **Automatic Operation**: CASCADE deletes happen automatically at the database level - no additional code required.

2. **Transaction Safety**: All CASCADE deletes are wrapped in a database transaction, ensuring data consistency.

3. **Performance**: CASCADE deletes are efficient as they're handled by PostgreSQL's internal mechanisms.

4. **No Orphaned Data**: This prevents orphaned records (complaints without a parent box, etc.).

5. **File Attachments**: While database records are deleted automatically, you may want to manually clean up files in the storage bucket periodically.

## Storage Bucket Cleanup

File attachments in the `complaint-attachments` storage bucket are NOT automatically deleted by CASCADE rules. To clean up orphaned files:

### Option 1: Manual Cleanup
1. Go to Supabase Dashboard → Storage
2. Navigate to `complaint-attachments` bucket
3. Delete files associated with deleted complaints

### Option 2: Scheduled Cleanup (Recommended for Production)
Consider implementing a scheduled edge function to periodically clean up orphaned files:

```typescript
// Example pseudocode for cleanup function
// This would run as a scheduled cron job
const cleanupOrphanedFiles = async () => {
  // Get all files in storage
  const files = await storage.list('complaint-attachments')
  
  // Get all complaint attachment_urls from database
  const complaints = await supabase.from('complaints').select('attachment_url')
  
  // Find files not referenced in database
  const orphanedFiles = files.filter(file => 
    !complaints.some(c => c.attachment_url?.includes(file.name))
  )
  
  // Delete orphaned files
  for (const file of orphanedFiles) {
    await storage.remove(`complaint-attachments/${file.name}`)
  }
}
```

## Testing CASCADE Deletes

### Test Procedure

1. **Create Test Data**:
   - Create a test complaint box
   - Submit 2-3 test complaints
   - Add some feedback
   - Wait for analytics to generate

2. **Verify Data Exists**:
   ```sql
   SELECT COUNT(*) FROM complaints WHERE box_id = 'your-test-box-id';
   SELECT COUNT(*) FROM feedbacks WHERE box_id = 'your-test-box-id';
   SELECT COUNT(*) FROM analytics WHERE box_id = 'your-test-box-id';
   ```

3. **Delete the Complaint Box**:
   - Use the delete button in admin dashboard
   - Confirm the deletion

4. **Verify Cascade Delete**:
   ```sql
   -- All should return 0
   SELECT COUNT(*) FROM complaints WHERE box_id = 'your-test-box-id';
   SELECT COUNT(*) FROM feedbacks WHERE box_id = 'your-test-box-id';
   SELECT COUNT(*) FROM analytics WHERE box_id = 'your-test-box-id';
   SELECT COUNT(*) FROM complaint_boxes WHERE id = 'your-test-box-id';
   ```

## Troubleshooting

### Issue: Related data not being deleted

**Possible Causes**:
1. CASCADE rules not properly configured
2. RLS policies blocking deletion
3. Database constraints preventing deletion

**Solution**:
1. Run the verification SQL query above
2. Check RLS policies are not conflicting
3. Re-run the `setup.sql` file to reset all constraints

### Issue: "Foreign key constraint violation" error

**Cause**: CASCADE rule missing or misconfigured

**Solution**: Run the manual setup SQL commands provided above

## Best Practices

1. **Always show warnings**: The UI should clearly communicate what will be deleted
2. **Require confirmation**: Use confirmation dialogs for destructive actions
3. **Log deletions**: Consider logging deletion events for audit purposes
4. **Test thoroughly**: Test CASCADE deletes in development before production
5. **Backup data**: Maintain regular database backups before large-scale deletions

## Conclusion

The CASCADE delete implementation ensures data integrity and automatic cleanup when complaint boxes are deleted. This reduces the risk of orphaned data and simplifies database maintenance while maintaining a clean and consistent database state.
