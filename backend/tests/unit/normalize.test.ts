import { describe, it, expect, vi } from 'vitest'
import { normalizeName } from '../../src/utils/normalize'

describe('normalizeName (RN03)', () => {
  it.each([
    ['RN03-01', '  Maria  ', 'maria'],
    ['RN03-02', 'João   da   Silva', 'joão da silva'],
    ['RN03-03', 'Ana\tMaria', 'ana maria'],
    ['RN03-04', 'Ana\nMaria', 'ana maria'],
    ['RN03-05', 'MARIA SILVA', 'maria silva'],
    ['RN03-06', '  TRABALHO   da\tFACULDADE  ', 'trabalho da faculdade'],
  ] as const)('%s: normaliza %j para %j', (_id, entrada, esperado) => {
    // Arrange
    const nome = entrada

    // Act
    const resultado = normalizeName(nome)

    // Assert
    expect(resultado).toBe(esperado)
  })
})
