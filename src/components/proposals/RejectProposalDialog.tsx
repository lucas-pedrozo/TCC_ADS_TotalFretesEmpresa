import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_COMMENT_LENGTH = 500;

type RejectProposalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onConfirm: (comment: string) => void | Promise<void>;
};

export function RejectProposalDialog({
  open,
  onOpenChange,
  loading = false,
  onConfirm,
}: RejectProposalDialogProps) {
  const { t } = useTranslation();
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!open) {
      setComment("");
    }
  }, [open]);

  const handleConfirm = () => {
    void onConfirm(comment);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle>{t("pages.freightDetail.rejectProposalDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("pages.freightDetail.rejectProposalDialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reject-proposal-comment">
            {t("pages.freightDetail.rejectProposalCommentLabel")}
          </Label>
          <textarea
            id="reject-proposal-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={t("pages.freightDetail.rejectProposalCommentPlaceholder")}
            maxLength={MAX_COMMENT_LENGTH}
            rows={4}
            disabled={loading}
            className={cn(
              "w-full min-w-0 resize-y rounded-md border border-input bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
            )}
          />
          <p className="text-xs text-muted-foreground tabular-nums">
            {comment.length}/{MAX_COMMENT_LENGTH}
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {t("pages.freightDetail.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-lg"
            disabled={loading}
            onClick={handleConfirm}
          >
            {t("pages.freightDetail.rejectProposalConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
