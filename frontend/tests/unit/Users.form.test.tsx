import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Users from '../../src/components/Users'
import { api } from '../../src/services/api'
import '@testing-library/jest-dom/vitest'

describe('Users — formulário de criação (RF04)', () => {
  it('exibe os campos Nome e Email e o botão Criar ao adicionar usuário', async () => {
    // Arrange: carrega a tela com uma lista vazia.
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: [] } })
    const user = userEvent.setup()
    render(<Users />)

    // Act: aguarda o carregamento e abre o formulário.
    await screen.findByRole('button', { name: 'Adicionar Usuário' })
    await user.click(screen.getByRole('button', { name: 'Adicionar Usuário' }))

    // Assert: os campos e a ação de criação estão disponíveis.
    expect(screen.getByLabelText('Nome:')).toBeInTheDocument()
    expect(screen.getByLabelText('Email:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument()
  })
})
