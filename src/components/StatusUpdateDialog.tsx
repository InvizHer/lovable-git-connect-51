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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl glass-card border-primary/30 p-3 sm:p-5 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-3">
          <DialogTitle className="gradient-text text-base sm:text-xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Change Status
          </DialogTitle>
          <DialogDescription className="text-[11px] sm:text-sm break-words line-clamp-2">
            {complaintTitle}
          </DialogDescription>
          
          {/* Current Status Indicator */}
          {currentStatusData && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Currently:</span>
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold",
                "bg-gradient-to-r",
                currentStatusData.iconBgStart,
                currentStatusData.iconBgEnd,
                currentStatusData.color
              )}>
                {(() => {
                  const Icon = currentStatusData.icon;
                  return <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
                })()}
                <span>{currentStatusData.label}</span>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 pt-2">
          {/* Status Cards Grid */}
          <div className="grid gap-2.5 sm:gap-3">
            {statusOptions.map((status) => {
              const Icon = status.icon;
              const isSelected = selectedStatus === status.value;
              const isCurrent = currentStatus === status.value;
              const isDisabled = isCurrent;

              return (
                <button
                  key={status.value}
                  onClick={() => !isDisabled && setSelectedStatus(status.value)}
                  disabled={isDisabled}
                  className={cn(
                    "relative overflow-hidden group",
                    "p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-300",
                    "bg-gradient-to-br",
                    status.gradientFrom,
                    status.gradientTo,
                    status.borderColor,
                    !isDisabled && status.hoverBorder,
                    "hover:shadow-lg",
                    !isDisabled && status.glowColor,
                    isSelected && !isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    !isDisabled && "cursor-pointer active:scale-[0.98]"
                  )}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "flex items-center justify-center shrink-0",
                      "w-11 h-11 sm:w-14 sm:h-14 rounded-xl",
                      "bg-gradient-to-br",
                      status.iconBgStart,
                      status.iconBgEnd,
                      "backdrop-blur-sm",
                      "transition-transform duration-300",
                      !isDisabled && "group-hover:scale-110"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5 sm:w-7 sm:h-7",
                        status.color
                      )} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                        <h3 className={cn(
                          "font-bold text-sm sm:text-base",
                          status.color
                        )}>
                          {status.label}
                        </h3>
                        {isCurrent && (
                          <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                        {status.description}
                      </p>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && !isCurrent && (
                      <div className={cn(
                        "absolute top-2 right-2 sm:top-3 sm:right-3",
                        "w-6 h-6 sm:w-7 sm:h-7 rounded-full",
                        "bg-gradient-to-r from-primary to-accent",
                        "flex items-center justify-center",
                        "animate-scale-in shadow-lg"
                      )}>
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Hover Effect Overlay */}
                  {!isDisabled && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
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
                "disabled:opacity-50"
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
