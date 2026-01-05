-- Criar política para INSERT na tabela ai_configurations
CREATE POLICY "Allow insert ai_configurations" 
ON public.ai_configurations 
FOR INSERT 
WITH CHECK (true);

-- Criar política para UPDATE na tabela ai_configurations
CREATE POLICY "Allow update ai_configurations" 
ON public.ai_configurations 
FOR UPDATE 
USING (true);

-- Criar política para DELETE na tabela ai_configurations
CREATE POLICY "Allow delete ai_configurations" 
ON public.ai_configurations 
FOR DELETE 
USING (true);