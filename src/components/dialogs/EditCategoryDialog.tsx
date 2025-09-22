import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: { id: string; name: string; description?: string | null } | null;
}

export const EditCategoryDialog = ({ open, onOpenChange }: EditCategoryDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar categoria</DialogTitle>
          <DialogDescription>Funcionalidade a ser implementada</DialogDescription>
        </DialogHeader>
        <Button onClick={() => onOpenChange(false)}>Fechar</Button>
      </DialogContent>
    </Dialog>
  );
};