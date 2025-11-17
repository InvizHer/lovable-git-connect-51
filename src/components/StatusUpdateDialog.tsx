import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, Clock, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: string;
  onStatusUpdate: (newStatus: string, note?: string) => Promise<void>;
  complaintTitle: string;
}

const statusOptions = [
  {
    value: "received",
    label: "Received",
    icon: Clock,
    description: "Complaint has been received and logged",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30",
  },
  {
    value: "under_review",
    label: "Under Review",
    icon: Play,
    description: "Actively reviewing and processing",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30",
  },
  {
    value: "solved",
    label: "Solved",
    icon: Check,
    description: "Issue has been resolved",
    color: "text-green-500",
    bgColor: "bg-green-500/10 hover:bg-green-500/20 border-green-500/30",
  },
];

export const StatusUpdateDialog = ({
  open,
  onOpenChange,
  currentStatus,
  onStatusUpdate,
  complaintTitle,
}: StatusUpdateDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) {
      onOpenChange(false);
      return;
    }

    setUpdating(true);
    try {
      await onStatusUpdate(selectedStatus, note);
      onOpenChange(false);
      setNote("");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl glass-card border-primary/30 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text text-lg sm:text-xl">Update Complaint Status</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm break-words">
            {complaintTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-semibold">Select New Status</Label>
            <div className="grid gap-2 sm:gap-3">
              {statusOptions.map((status) => {
                const Icon = status.icon;
                const isSelected = selectedStatus === status.value;
                const isCurrent = currentStatus === status.value;

                return (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={cn(
                      "relative p-3 sm:p-4 rounded-lg border-2 transition-all text-left w-full",
                      status.bgColor,
                      isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      isCurrent && "opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={cn("mt-0.5", status.color)}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm sm:text-base">{status.label}</span>
                          {isCurrent && (
                            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-muted-foreground">
                          {status.description}
                        </p>
                      </div>
                      {isSelected && !isCurrent && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedStatus !== currentStatus && (
            <div className="animate-fade-in space-y-2">
              <Label htmlFor="note" className="text-xs sm:text-sm font-semibold">
                Add Note (Optional)
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any additional notes about this status change..."
                rows={3}
                className="resize-none bg-background/50 text-xs sm:text-sm"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updating}
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updating || selectedStatus === currentStatus}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm"
            >
              {updating ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
