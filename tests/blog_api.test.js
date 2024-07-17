const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const initialBlogs = [
    {
      title: 'Ruokablogi',
      author: 'Kokki Kolmonen',
      url: 'www.ruokaonhyvaa.fi',
      likes: 10
    },
    {
        title: 'Autoblogi',
        author: 'Kari Taalasmaa',
        url: 'www.autoblogi.fi',
        likes: 1000
    },
  ]
  
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(initialBlogs)
  })

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are correct number of blogs', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, initialBlogs.length)
  })

describe('the returned id field is called id and not _id', () => {
    test('_id field does not exists', async () => {
        const response = await api.get('/api/blogs')
        assert.deepStrictEqual(response.body[0]._id, undefined)
    })
    test('id field exists', async () => {
        const response = await api.get('/api/blogs')
        assert.notDeepEqual(response.body[0].id, undefined)
    })
})

test('a blog can be added ', async () => {
    const newBlog = {
        title: 'Matkailublogi',
        author: 'Matti Matkustelija',
        url: 'www.matkusteluonkivaa.fi',
        likes: 500
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
    const authors = response.body.map(r => r.author)
    assert.strictEqual(response.body.length, initialBlogs.length + 1)
    assert(authors.includes('Matti Matkustelija'))
})

test('likes is set to zero if the field is missing in the post request', async () =>{
    const newBlog = {
        title: 'Matkailublogi',
        author: 'Matti Matkustelija',
        url: 'www.matkusteluonkivaa.fi',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
    const addedBlog = response.body.filter(r => r.author === 'Matti Matkustelija')
    assert.strictEqual(response.body.length, initialBlogs.length + 1)
    assert.strictEqual(addedBlog[0].likes, 0)
})

describe('if title or url is missing from the request a 404 response is sent', () => {
    test('title missing', async () =>{
        const newBlog = {
            url: 'www.matkusteluonkivaa.fi',
        }
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })
    test('url missing', async () =>{
        const newBlog = {
            author: 'Matti Matkustelija',
            url: 'www.matkusteluonkivaa.fi',
        }
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })
    test('both missing', async () =>{
        const newBlog = {
            author: 'Matti Matkustelija',
            likes: 10,
        }
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })
})

test('a blog can be deleted', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToDelete = blogsAtStart.body[0]
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  
    const blogsAtEnd = await api.get('/api/blogs')
  
    const titles = blogsAtEnd.body.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))
  
    assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length - 1)
  })

after(async () => {
  await mongoose.connection.close()
})