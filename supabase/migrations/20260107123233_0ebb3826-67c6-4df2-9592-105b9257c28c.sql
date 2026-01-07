-- Limpar stories antigos com base64 (dados corrompidos/antigos)
DELETE FROM health_feed_stories 
WHERE media_url LIKE 'data:image%' 
   OR media_url LIKE 'data:video%';