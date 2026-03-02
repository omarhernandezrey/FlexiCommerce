import { render, screen } from '@testing-library/react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

describe('MaterialIcon', () => {
  it('renderiza el nombre del ícono como texto', () => {
    render(<MaterialIcon name="home" />);
    expect(screen.getByText('home')).toBeInTheDocument();
  });

  it('aplica la clase CSS personalizada', () => {
    render(<MaterialIcon name="star" className="text-yellow-500" />);
    const el = screen.getByText('star');
    expect(el).toHaveClass('text-yellow-500');
  });

  it('aplica fill-1 cuando filled=true', () => {
    render(<MaterialIcon name="favorite" filled />);
    const el = screen.getByText('favorite');
    expect(el).toHaveClass('fill-1');
  });

  it('NO aplica fill-1 cuando filled es falso o ausente', () => {
    render(<MaterialIcon name="favorite" />);
    const el = screen.getByText('favorite');
    expect(el).not.toHaveClass('fill-1');
  });
});
