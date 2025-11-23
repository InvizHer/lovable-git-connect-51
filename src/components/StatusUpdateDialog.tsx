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
import { Check, Clock, Play, Loader2, ArrowRight } from "lucide-react";
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
    description: "Complaint logged in system",
    color: "text-blue-500",
    borderColor: "border-blue-500",
    bgGradient: "bg-gradient-to-br from-blue-500/10 to-blue-600/5",
    iconBg: "bg-blue-500/20",
    step: 1,
  },
  {
    value: "under_review",
    label: "Under Review",
    icon: Play,
    description: "Currently being processed",
    color: "text-amber-500",
    borderColor: "border-amber-500",
    bgGradient: "bg-gradient-to-br from-amber-500/10 to-amber-600/5",
    iconBg: "bg-amber-500/20",
    step: 2,
  },
  {
    value: "solved",
    label: "Solved",
    icon: Check,
    description: "Issue successfully resolved",
    color: "text-green-500",
    borderColor: "border-green-500",
    bgGradient: "bg-gradient-to-br from-green-500/10 to-green-600/5",
    iconBg: "bg-green-500/20",
    step: 3,
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

  const currentStatusData = statusOptions.find(s => s.value === currentStatus);
  const selectedStatusData = statusOptions.find(s => s.value === selectedStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl glass-card border-primary/30 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="gradient-text text-lg sm:text-2xl">Update Status</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm break-words">
            {complaintTitle}
          </DialogDescription>
          
          {/* Current Status Badge */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Current Status:</span>
            {currentStatusData && (
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                currentStatusData.iconBg,
                currentStatusData.color
              )}>
                {(() => {
                  const Icon = currentStatusData.icon;
                  return <Icon className="w-3.5 h-3.5" />;
                })()}
                <span>{currentStatusData.label}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 sm:space-y-6 pt-4">
          {/* Status Flow Timeline */}
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              {statusOptions.map((status, index) => {
                const Icon = status.icon;
                const isCurrent = currentStatus === status.value;
                const isSelected = selectedStatus === status.value;
                const isPast = statusOptions.findIndex(s => s.value === currentStatus) >= index;
                
                return (
                  <div key={status.value} className="flex flex-col items-center flex-1 relative">
                    {index < statusOptions.length - 1 && (
                      <div className={cn(
                        "absolute top-6 left-[50%] w-full h-0.5 -z-10",
                        isPast ? "bg-primary/30" : "bg-border"
                      )} />
                    )}
                    <button
                      onClick={() => setSelectedStatus(status.value)}
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all mb-2",
                        "border-2",
                        isSelected && status.borderColor,
                        isSelected && status.iconBg,
                        !isSelected && isCurrent && "border-primary/50 bg-primary/10",
                        !isSelected && !isCurrent && isPast && "border-border bg-muted",
                        !isSelected && !isCurrent && !isPast && "border-dashed border-border bg-background",
                        isSelected && "scale-110 shadow-lg"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                        isSelected ? status.color : isCurrent ? "text-primary" : isPast ? "text-muted-foreground" : "text-muted-foreground/40"
                      )} />
                    </button>
                    <span className={cn(
                      "text-[10px] sm:text-xs font-medium text-center",
                      isSelected ? status.color : isCurrent ? "text-primary" : "text-muted-foreground"
                    )}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Status Info */}
          {selectedStatusData && (
            <div className={cn(
              "p-4 sm:p-5 rounded-xl border-2 transition-all animate-fade-in",
              selectedStatusData.bgGradient,
              selectedStatusData.borderColor
            )}>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={cn(
                  "p-2.5 sm:p-3 rounded-lg shrink-0",
                  selectedStatusData.iconBg
                )}>
                  {(() => {
                    const Icon = selectedStatusData.icon;
                    return <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", selectedStatusData.color)} />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-base sm:text-lg">{selectedStatusData.label}</h3>
                    {selectedStatus !== currentStatus && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-medium">New Status</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {selectedStatusData.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Note Section */}
          {selectedStatus !== currentStatus && (
            <div className="animate-fade-in space-y-2.5">
              <Label htmlFor="note" className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                Add Update Note
                <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Provide additional context about this status change..."
                rows={3}
                className="resize-none bg-background/50 text-xs sm:text-sm border-border focus:border-primary/50 transition-colors"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updating}
              className="w-full sm:w-auto text-sm border-border hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updating || selectedStatus === currentStatus}
              className={cn(
                "w-full sm:w-auto text-sm font-semibold transition-all",
                "bg-gradient-to-r from-primary to-accent hover:opacity-90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {updating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  Updating Status...
                </>
              ) : selectedStatus === currentStatus ? (
                "Select Different Status"
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Confirm Update
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
