import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import Users from '../../src/components/Users'
import { server } from '../msw/server'

describe('Users + API — criação de usuário (RF08 / RF09)', () => {
  it('envia os dados no POST e exibe o novo usuário após recarregar a lista (RF08)', async () => {
    const user = userEvent.setup()
    let corpoRecebido: unknown
    let quantidadeConsultas = 0

    server.use(
      http.get('*/api/users', () => {
        quantidadeConsultas += 1
        return HttpResponse.json({
          success: true,
          count: quantidadeConsultas > 1 ? 1 : 0,
          data: quantidadeConsultas > 1
            ? [{ id: 'u2', name: 'Bruna Lima', email: 'bruna@example.com', createdAt: '2026-01-01T00:00:00.000Z', tasks: [] }]
            : []
        })
      }),
      http.post('*/api/users', async ({ request }) => {
        corpoRecebido = await request.json()
        return HttpResponse.json({ success: true, data: { id: 'u2', name: 'Bruna Lima', email: 'bruna@example.com' } }, { status: 201 })
      })
    )

    render(<Users />)
    await user.click(await screen.findByRole('button', { name: 'Adicionar Usuário' }))
    await user.type(screen.getByLabelText('Nome:'), 'Bruna Lima')
    await user.type(screen.getByLabelText('Email:'), 'bruna@example.com')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await screen.findByText('Bruna Lima')
    expect(corpoRecebido).toEqual({ name: 'Bruna Lima', email: 'bruna@example.com' })
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Criar' })).not.toBeInTheDocument())
    expect(screen.getByText('bruna@example.com')).toBeInTheDocument()
  })

  it.fails('mostra mensagem específica no 409 e preserva formulário e dados (RF09)', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('*/api/users', () => HttpResponse.json({ success: true, count: 0, data: [] })),
      http.post('*/api/users', () => HttpResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      ))
    )

    render(<Users />)
    await user.click(await screen.findByRole('button', { name: 'Adicionar Usuário' }))
    await user.type(screen.getByLabelText('Nome:'), 'Caio Reis')
    await user.type(screen.getByLabelText('Email:'), 'caio@example.com')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    expect(await screen.findByText('Email já cadastrado')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome:')).toHaveValue('Caio Reis')
    expect(screen.getByLabelText('Email:')).toHaveValue('caio@example.com')
  })
})
