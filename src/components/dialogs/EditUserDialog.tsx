import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any;
}

export const EditUserDialog = ({ open, onOpenChange }: EditUserDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
          <DialogDescription>Funcionalidade a ser implementada</DialogDescription>
        </DialogHeader>
        <Button onClick={() => onOpenChange(false)}>Fechar</Button>
      </DialogContent>
    </Dialog>
  );
};