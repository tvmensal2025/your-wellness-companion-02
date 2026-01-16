import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface DocumentFiltersProps {
  searchTerm: string;
  filterType: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  searchTerm,
  filterType,
  onSearchChange,
  onFilterChange
}) => {
  const documentTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'exame_laboratorial', label: 'Exames Lab.' },
    { value: 'exame_imagem', label: 'Imagens' },
    { value: 'relatorio_medico', label: 'Relatórios' },
    { value: 'prescricao', label: 'Prescrições' },
  ];

  return (
    <div className="flex flex-col gap-3 mb-4 sm:mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar documentos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 text-sm"
        />
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {documentTypes.map((type) => (
          <Button
            key={type.value}
            variant={filterType === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(type.value)}
            className="flex-shrink-0 text-xs"
          >
            <Filter className="w-3 h-3 mr-1" />
            {type.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
