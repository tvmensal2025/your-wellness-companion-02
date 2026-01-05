import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  AlertCircle,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from './ImageUpload';

interface Product {
  id: string;
  external_id: string;
  name: string;
  category: string;
  brand: string;
  original_price: number;
  discount_price: number;
  stock_quantity: number;
  is_approved: boolean;
  tags: string[];
  image_url?: string;
  description?: string;
}

export const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .order('name');

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de suplementos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.external_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormData({ ...product });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setCurrentProduct(null);
    setFormData({
      name: '',
      category: '',
      brand: "MaxNutrition",
      original_price: 0,
      stock_quantity: 0,
      description: '',
      tags: []
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        toast({ title: "Nome obrigatório", variant: "destructive" });
        return;
      }

      const productData = {
        ...formData,
        name: formData.name, // Ensure name is explicitly set
        // Recalcular desconto automático se mudar o preço
        discount_price: formData.original_price ? formData.original_price * 0.5 : 0
      };

      let error;
      if (isEditing && currentProduct) {
        const { error: updateError } = await supabase
          .from('supplements')
          .update(productData)
          .eq('id', currentProduct.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('supplements')
          .insert([productData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: isEditing ? "Produto atualizado" : "Produto criado",
        description: "As alterações foram salvas com sucesso."
      });
      
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o produto.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('supplements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Produto excluído" });
      fetchProducts();
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, categoria ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-500" />
            Catálogo de Suplementos ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando produtos...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
              <Button onClick={() => setSearchTerm('')} variant="outline">
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagem</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                         <div className="h-12 w-12 rounded-md bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                           {product.image_url ? (
                             <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                           ) : (
                             <Package className="h-6 w-6 text-gray-300" />
                           )}
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs text-muted-foreground">{product.brand} • {product.external_id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-emerald-600">
                            R$ {product.discount_price?.toFixed(2)}
                          </span>
                          {product.original_price > product.discount_price && (
                            <span className="text-xs text-muted-foreground line-through">
                              R$ {product.original_price?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${product.stock_quantity > 10 ? 'bg-green-500' : product.stock_quantity > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          {product.stock_quantity}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOGO DE EDIÇÃO */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do produto abaixo. As alterações são salvas em tempo real no banco de dados.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
               {/* Imagem */}
               <div className="col-span-2">
                 <ImageUpload 
                    currentImageUrl={formData.image_url}
                    onImageChange={(url) => setFormData({...formData, image_url: url || ''})}
                    productId={currentProduct?.id || 'new'}
                    productName={formData.name || 'Novo Produto'}
                 />
               </div>

               <div className="col-span-2">
                 <Label>Nome do Produto</Label>
                 <Input 
                   value={formData.name || ''} 
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                 />
               </div>
               
               <div>
                 <Label>Categoria</Label>
                 <Input 
                   value={formData.category || ''} 
                   onChange={(e) => setFormData({...formData, category: e.target.value})}
                 />
               </div>

               <div>
                 <Label>ID Externo (Código)</Label>
                 <Input 
                   value={formData.external_id || ''} 
                   onChange={(e) => setFormData({...formData, external_id: e.target.value})}
                 />
               </div>

               <div>
                 <Label>Preço Original (R$)</Label>
                 <Input 
                   type="number"
                   value={formData.original_price || 0} 
                   onChange={(e) => setFormData({...formData, original_price: parseFloat(e.target.value)})}
                 />
               </div>

               <div>
                 <Label>Estoque</Label>
                 <Input 
                   type="number"
                   value={formData.stock_quantity || 0} 
                   onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                 />
               </div>

               <div className="col-span-2">
                 <Label>Descrição</Label>
                 <Textarea 
                   value={formData.description || ''} 
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   className="h-24"
                 />
               </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
