import { describe, it, expect, vi } from 'vitest'

// Mock de todos os módulos necessários antes de importar o componente
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/img.png' } }),
      }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { response: 'Olá! Eu sou a Sofia.' }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        order: () => ({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  },
}))

describe('SofiaChat', () => {
  it('módulo deve ser importável sem erros', async () => {
    // Apenas verifica que o módulo pode ser importado
    const module = await import('./SofiaChat')
    expect(module).toBeDefined()
    expect(module.default).toBeDefined()
  }, 15000) // Timeout de 15 segundos
})
