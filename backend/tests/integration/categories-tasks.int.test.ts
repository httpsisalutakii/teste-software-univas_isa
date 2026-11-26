import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../../src/app'
import { prisma, resetDb, seedUserAndCategory } from './helpers/db'

describe('API03 — DELETE /api/categories/:id', () => {
  beforeEach(resetDb)
  afterAll(async () => prisma.$disconnect())

  it('exclui categoria sem tarefas e confirma a remoção no banco', async () => {
    const category = await prisma.category.create({ data: { name: 'arquivo' } })

    const response = await request(app).delete(`/api/categories/${category.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ success: true })
    expect(await prisma.category.findUnique({ where: { id: category.id } })).toBeNull()
  })

  it('recusa excluir categoria com tarefa e mantém ambos os registros', async () => {
    const { user, category } = await seedUserAndCategory()
    const task = await prisma.task.create({
      data: { title: 'Relatório', userId: user.id, categoryId: category.id }
    })

    const response = await request(app).delete(`/api/categories/${category.id}`)

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(await prisma.category.findUnique({ where: { id: category.id } })).not.toBeNull()
    expect(await prisma.task.findUnique({ where: { id: task.id } })).not.toBeNull()
  })

  it('responde 404 ao excluir categoria inexistente', async () => {
    const response = await request(app).delete('/api/categories/id-inexistente')

    expect(response.status).toBe(404)
    expect(response.body.success).toBe(false)
    expect(await prisma.category.count()).toBe(0)
  })
})

describe('API04 — POST /api/categories', () => {
  beforeEach(resetDb)
  afterAll(async () => prisma.$disconnect())

  it('cria categoria com nome inédito e grava o nome no banco', async () => {
    const response = await request(app).post('/api/categories').send({ name: 'Faculdade' })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({ success: true, data: { name: 'Faculdade' } })
    expect(await prisma.category.findUnique({ where: { name: 'Faculdade' } })).not.toBeNull()
  })

  it.fails('recusa nome duplicado após normalização e não cria outra categoria', async () => {
    await prisma.category.create({ data: { name: ' trabalho ' } })

    const response = await request(app).post('/api/categories').send({ name: 'Trabalho' })

    expect(response.status).toBe(409)
    expect(response.body.success).toBe(false)
    expect(await prisma.category.count()).toBe(1)
  })
})

describe('API05 — PUT /api/tasks/:id', () => {
  beforeEach(resetDb)
  afterAll(async () => prisma.$disconnect())

  it('permite transição PENDING para IN_PROGRESS e grava o novo status', async () => {
    const { user, category } = await seedUserAndCategory()
    const task = await prisma.task.create({
      data: { title: 'Estudar', userId: user.id, categoryId: category.id, status: 'PENDING' }
    })

    const response = await request(app).put(`/api/tasks/${task.id}`).send({ status: 'IN_PROGRESS' })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ success: true, data: { status: 'IN_PROGRESS' } })
    expect((await prisma.task.findUnique({ where: { id: task.id } }))?.status).toBe('IN_PROGRESS')
  })

  it.fails('recusa transição COMPLETED para PENDING e mantém tarefa inalterada', async () => {
    const { user, category } = await seedUserAndCategory()
    const task = await prisma.task.create({
      data: { title: 'Concluída', userId: user.id, categoryId: category.id, status: 'COMPLETED' }
    })

    const response = await request(app).put(`/api/tasks/${task.id}`).send({ status: 'PENDING' })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect((await prisma.task.findUnique({ where: { id: task.id } }))?.status).toBe('COMPLETED')
  })

  it('responde 404 para tarefa inexistente', async () => {
    const response = await request(app).put('/api/tasks/id-inexistente').send({ status: 'IN_PROGRESS' })

    expect(response.status).toBe(404)
    expect(response.body.success).toBe(false)
    expect(await prisma.task.count()).toBe(0)
  })
})
