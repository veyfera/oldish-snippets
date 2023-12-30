const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

// static signup method
userSchema.statics.signup = async function(username:string, password:string) {

  if (!username || !password) {
    throw Error('Все поля должны быть заполнены')
  }

  const exists = await this.findOne({ username })

  if (exists) {
    throw Error('Такое имя уже занято')
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const user = await this.create({ username, password: hash })

  return user
}

userSchema.statics.login = async function(username:string, password:string) {

    if (!username|| !password) {
        throw Error('Все поля должны быть заполнены')
    }

    const user = await this.findOne({ username })
    if (!user) {
        throw Error('Такого пользователя не найдено')
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
        throw Error('Пароль введен не верно')
    }

    return user
}

const User = mongoose.model('User', userSchema);
export default User;

