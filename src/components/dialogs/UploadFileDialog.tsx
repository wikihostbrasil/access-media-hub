import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UploadFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UploadFileDialog = ({ open, onOpenChange }: UploadFileDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload arquivo</DialogTitle>
          <DialogDescription>Funcionalidade a ser implementada</DialogDescription>
        </DialogHeader>
        <Button onClick={() => onOpenChange(false)}>Fechar</Button>
      </DialogContent>
    </Dialog>
  );
};