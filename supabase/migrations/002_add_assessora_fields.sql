-- Add assessora fields to noivas table
ALTER TABLE noivas 
ADD COLUMN IF NOT EXISTS nome_segundo_parceiro text,
ADD COLUMN IF NOT EXISTS assessora_nome text,
ADD COLUMN IF NOT EXISTS assessora_ddd text,
ADD COLUMN IF NOT EXISTS assessora_telefone text;

-- Add comments for clarity
COMMENT ON COLUMN noivas.nome_segundo_parceiro IS 'Nome do segundo parceiro/parceira (para casamentos LGBTQ+)';
COMMENT ON COLUMN noivas.assessora_nome IS 'Nome da assessora do casamento';
COMMENT ON COLUMN noivas.assessora_ddd IS 'DDD do telefone da assessora';
COMMENT ON COLUMN noivas.assessora_telefone IS 'Telefone da assessora';
