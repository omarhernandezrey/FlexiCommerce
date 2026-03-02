import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../components/Button';

describe('Button', () => {
  it('renderiza el título correctamente', () => {
    const { getByText } = render(
      <Button title="Agregar al Carrito" onPress={() => {}} />
    );
    expect(getByText('Agregar al Carrito')).toBeTruthy();
  });

  it('llama al handler onPress al hacer tap', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <Button title="Comprar" onPress={mockPress} />
    );
    fireEvent.press(getByText('Comprar'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('no llama al handler cuando está disabled', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <Button title="Comprar" onPress={mockPress} disabled />
    );
    fireEvent.press(getByText('Comprar'));
    expect(mockPress).not.toHaveBeenCalled();
  });

  it('muestra "Loading..." cuando loading es true', () => {
    const { getByText } = render(
      <Button title="Enviar" onPress={() => {}} loading />
    );
    expect(getByText('Loading...')).toBeTruthy();
  });
});
