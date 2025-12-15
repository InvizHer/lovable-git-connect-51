import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Clock, Play, Loader2, Sparkles } from "lucide-react";
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
    description: "Complaint has been logged and acknowledged",
    color: "text-blue-500",
    gradientFrom: "from-blue-500/20",
    gradientTo: "to-blue-500/5",
    borderColor: "border-blue-500/40",
    glowColor: "shadow-blue-500/20",
    hoverBorder: "hover:border-blue-500",
    iconBgStart: "from-blue-500/30",
    iconBgEnd: "to-blue-600/20",
  },
  {
    value: "under_review",
    label: "Under Review",
    icon: Play,
    description: "Team is actively working on this complaint",
    color: "text-amber-500",
    gradientFrom: "from-amber-500/20",
    gradientTo: "to-amber-500/5",
    borderColor: "border-amber-500/40",
    glowColor: "shadow-amber-500/20",
    hoverBorder: "hover:border-amber-500",
    iconBgStart: "from-amber-500/30",
    iconBgEnd: "to-amber-600/20",
  },
  {
    value: "solved",
    label: "Solved",
    icon: Check,
    description: "Complaint has been successfully resolved",
    color: "text-green-500",
    gradientFrom: "from-green-500/20",
    gradientTo: "to-green-500/5",
    borderColor: "border-green-500/40",
    glowColor: "shadow-green-500/20",
    hoverBorder: "hover:border-green-500",
    iconBgStart: "from-green-500/30",
    iconBgEnd: "to-green-600/20",
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
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) {
      onOpenChange(false);
      return;
    }

    setUpdating(true);
    try {
      await onStatusUpdate(selectedStatus);
      onOpenChange(false);
    } finally {
      setUpdating(false);
    }
  };

  const currentStatusData = statusOptions.find(s => s.value === currentStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg glass-card border-primary/30 p-0 gap-0 max-h-[90vh] overflow-hidden">
        {/* Enhanced Header Section */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Icon Container */}
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            
            {/* Title & Complaint Info */}
            <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                Update Complaint Status
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {complaintTitle}
              </DialogDescription>
              
              {/* Current Status Badge */}
              {currentStatusData && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Current:</span>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold",
                    "bg-primary/10 text-primary border border-primary/20"
                  )}>
                    <currentStatusData.icon className="w-3 h-3" />
                    {currentStatusData.label}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Status Selection List */}
          <div className="space-y-2.5">
            <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Select new status
            </p>

            <div className="flex flex-col gap-2">
              {statusOptions.map((status) => {
                const Icon = status.icon;
                const isSelected = selectedStatus === status.value;
                const isCurrent = currentStatus === status.value;
                const isDisabled = isCurrent;

                return (
                  <button
                    key={status.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setSelectedStatus(status.value)}
                    className={cn(
                      "w-full rounded-lg border bg-background/60 px-3 py-2.5 sm:px-4 sm:py-3 text-left transition-all duration-200",
                      "flex items-center gap-3 sm:gap-4",
                      "hover:bg-accent/40",
                      isSelected && !isCurrent && "border-primary bg-primary/5 shadow-md",
                      isDisabled && "cursor-not-allowed opacity-60",
                    )}
                  >
                    {/* Icon bubble */}
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground shrink-0",
                        isCurrent && "bg-primary text-primary-foreground border-primary",
                        !isCurrent && isSelected && "border-primary/70 text-primary",
                      )}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-semibold">
                          {status.label}
                        </h3>
                        {isCurrent && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-primary">
                            CURRENT
                          </span>
                        )}
                        {!isCurrent && isSelected && (
                          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-accent-foreground">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                        {status.description}
                      </p>
                    </div>

                    {/* Selection indicator */}
                    <div className="shrink-0">
                      {isSelected && !isCurrent ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-primary bg-primary/10">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-border" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updating}
              className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updating || selectedStatus === currentStatus}
              className={cn(
                "w-full sm:w-auto text-xs sm:text-sm font-semibold h-9 sm:h-10",
                "bg-gradient-to-r from-primary to-accent hover:opacity-90",
                "transition-all duration-300",
                "disabled:opacity-50",
              )}
            >
              {updating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : selectedStatus === currentStatus ? (
                "Select New Status"
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-2" />
                  Update Status
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
