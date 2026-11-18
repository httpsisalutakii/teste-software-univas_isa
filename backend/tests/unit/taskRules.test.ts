import { describe, it, expect, vi } from 'vitest'
import { canTransition, type Status } from '../../src/utils/taskRules'

describe('canTransition (RN01)', () => {
  it.each([
    ['RN01-01', 'PENDING', 'PENDING', false],
    ['RN01-02', 'PENDING', 'IN_PROGRESS', true],
    ['RN01-03', 'PENDING', 'COMPLETED', false],
    ['RN01-05', 'IN_PROGRESS', 'PENDING', false],
    ['RN01-06', 'IN_PROGRESS', 'IN_PROGRESS', false],
    ['RN01-07', 'IN_PROGRESS', 'COMPLETED', true],
    ['RN01-08', 'IN_PROGRESS', 'CANCELLED', true],
    ['RN01-09', 'COMPLETED', 'PENDING', false],
    ['RN01-10', 'COMPLETED', 'IN_PROGRESS', false],
    ['RN01-11', 'COMPLETED', 'COMPLETED', false],
    ['RN01-12', 'COMPLETED', 'CANCELLED', false],
    ['RN01-13', 'CANCELLED', 'PENDING', false],
    ['RN01-14', 'CANCELLED', 'IN_PROGRESS', false],
    ['RN01-15', 'CANCELLED', 'COMPLETED', false],
    ['RN01-16', 'CANCELLED', 'CANCELLED', false],
  ] as const)('%s: de %s para %s retorna %s conforme a regra', (_id, from, to, esperado) => {
    // Arrange
    const statusAtual: Status = from
    const statusDesejado: Status = to

    // Act
    const resultado = canTransition(statusAtual, statusDesejado)

    // Assert
    expect(resultado).toBe(esperado)
  })

  it.fails('RN01-04: permite cancelar uma tarefa PENDING', () => {
    // A especificação permite cancelar uma tarefa antes de iniciá-la.
    expect(canTransition('PENDING', 'CANCELLED')).toBe(true)
  })
})
