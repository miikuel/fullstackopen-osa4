const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.length === 0) {
    return 0
  } else if (blogs.length === 1) {
    return blogs[0].likes
  } else if (blogs.length > 1) {
    return blogs.reduce((sum, blog) => blog.likes + sum, 0)
  }
}

const favoriteBlog = (blogs) => {
  const mostLikes = blogs.reduce((likes, blog) => Math.max(blog.likes, likes),0)
  const filteredBlogs = blogs.filter(blog => blog.likes === mostLikes)
  return filteredBlogs[0]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
