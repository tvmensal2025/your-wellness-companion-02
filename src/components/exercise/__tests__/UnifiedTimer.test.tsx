import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UnifiedTimer, RestTimer, InlineRestTimer, MiniTimer } from '../UnifiedTimer';

// Mock do Web Audio API
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    createOscillator: vi.fn().mockReturnValue({
      connect: vi.fn(),
      frequency: { value: 0 },
      type: 'sine',
      start: vi.fn(),
      stop: vi.fn(),
    }),
    createGain: vi.fn().mockReturnValue({
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    }),
    destination: {},
    currentTime: 0,
  })),
});

// Mock do navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: vi.fn(),
});

describe('UnifiedTimer', () => {
  it('renderiza versão full por padrão', () => {
    render(<UnifiedTimer seconds={60} />);
    expect(screen.getByText('Descanso')).toBeInTheDocument();
    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  it('renderiza versão mini corretamente', () => {
    render(<UnifiedTimer seconds={30} variant="mini" />);
    expect(screen.getByText('30s')).toBeInTheDocument();
  });

  it('renderiza versão compact corretamente', () => {
    render(<UnifiedTimer seconds={45} variant="compact" />);
    expect(screen.getByText('0:45')).toBeInTheDocument();
  });

  it('renderiza versão inline corretamente', () => {
    render(<UnifiedTimer seconds={60} variant="inline" />);
    expect(screen.getByText('Descansando...')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('chama onComplete quando timer termina', async () => {
    const onComplete = vi.fn();
    render(<UnifiedTimer seconds={1} autoStart={true} onComplete={onComplete} />);
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('permite pausar e retomar timer', () => {
    render(<UnifiedTimer seconds={60} />);
    
    const playButton = screen.getByText('Iniciar');
    fireEvent.click(playButton);
    
    expect(screen.getByText('Pausar')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Pausar'));
    expect(screen.getByText('Iniciar')).toBeInTheDocument();
  });

  it('permite ajustar tempo', () => {
    render(<UnifiedTimer seconds={60} />);
    
    const plusButton = screen.getByRole('button', { name: /plus/i });
    fireEvent.click(plusButton);
    
    expect(screen.getByText('1:15')).toBeInTheDocument();
  });
});

describe('Compatibilidade com componentes antigos', () => {
  it('RestTimer funciona com props antigas', () => {
    const onComplete = vi.fn();
    render(
      <RestTimer 
        defaultSeconds={30} 
        onComplete={onComplete}
        compact={false}
        showSkip={true}
      />
    );
    
    expect(screen.getByText('Descanso')).toBeInTheDocument();
    expect(screen.getByText('0:30')).toBeInTheDocument();
  });

  it('RestTimer compact funciona', () => {
    render(<RestTimer defaultSeconds={45} compact={true} />);
    expect(screen.getByText('0:45')).toBeInTheDocument();
  });

  it('InlineRestTimer funciona com props antigas', () => {
    render(
      <InlineRestTimer 
        seconds={90}
        nextSetNumber={2}
        totalSets={3}
        autoStart={false}
      />
    );
    
    expect(screen.getByText('Próxima: Série 2/3')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
  });

  it('MiniTimer funciona', () => {
    render(<MiniTimer seconds={20} />);
    expect(screen.getByText('20s')).toBeInTheDocument();
  });
});

describe('Funcionalidades avançadas', () => {
  it('mostra mensagem motivacional quando habilitada', () => {
    render(<UnifiedTimer seconds={60} showMotivation={true} />);
    
    // Verifica se há pelo menos um emoji (todas as mensagens têm)
    const motivationalSection = screen.getByText(/💪|🔥|⚡|🎯|💚|🏆|✨|🚀|🌟|💥/);
    expect(motivationalSection).toBeInTheDocument();
  });

  it('esconde presets quando desabilitados', () => {
    render(<UnifiedTimer seconds={60} showPresets={false} />);
    
    expect(screen.queryByText('30s')).not.toBeInTheDocument();
    expect(screen.queryByText('45s')).not.toBeInTheDocument();
  });

  it('esconde ajustes quando desabilitados', () => {
    render(<UnifiedTimer seconds={60} showAdjustments={false} />);
    
    // Não deve ter botões de + e - para ajustar tempo
    const adjustButtons = screen.queryAllByRole('button', { name: /plus|minus/i });
    expect(adjustButtons).toHaveLength(0);
  });

  it('controla som externamente', () => {
    render(<UnifiedTimer seconds={60} externalSoundEnabled={false} />);
    
    // Não deve mostrar controle de som quando controlado externamente
    expect(screen.queryByRole('button', { name: /volume/i })).not.toBeInTheDocument();
  });
});