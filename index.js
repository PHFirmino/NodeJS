const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const sha1 = require("sha1/sha1")
require("dotenv").config()
const database = require("./database/database")

let secret = process.env.SECRET_KEY
const app = express()
app.use(express.json())
app.use(cors())


const verificar = (request, response, next) => {
    try{
        const token = request.headers.authorization
        const tokenReplace = token.replace("Bearer ", "")
        jwt.verify(tokenReplace, secret)
        next()
    }
    catch{
        response.status(401).json({
            mensagem: "Token inválido"
        })
    }
}


app.get("/login", (resquest, response) => {
    let {email, senha} = resquest.body
    senha = sha1(senha)

    database.select("*").table("registro").where({email:email, senha:senha}).then(data => {

        if(data.length > 0){

            const token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                data: {
                    email: data[0].email,
                    nome : data[0].nome,
                }
            }, 
            secret);

            response.status(200).json({
                mensagem: "Login realizado com sucesso",
                token: token
            })
        }
        else{
            response.status(401).json({
                mensagem: "Email ou senha inválidos"
            })
        }
    })
})

app.get("/", verificar, (request, response) => {
    database.select("*").table("registro").then(data => {
            response.status(200).json({
                    mensagem : data
                }
            )
        }
    )
})

app.get("/unico/:id", verificar, (request, response) => {
    const id = request.params.id

    database.select("*").table("registro").where({id:id}).then(data => {
        response.status(200).json({
            mensagem : data
        })
    })

})

app.post("/criarRegistro", (request, response) => {
    let {nome, email, senha} = request.body
    senha = sha1(senha)

    database.insert({nome, email, senha}).table("registro").then(
        response.status(201).json({
            mensagem : "Registro criado com sucesso"
        })
    )
})

app.put("/editarRegistro/:id", verificar, (request, response) => {
    const id = request.params.id
    const {nome, email, senha} = request.body

    database.update({nome, email, senha}).table("registro").where({id:id}).then(
        response.status(201).json({
            mensagem : "Registro editado com sucesso"
        })
    )
})

app.delete("/deletarRegistro/:id", verificar, (request, response) => {
    const id = request.params.id

    database.delete().table("registro").where({id:id}).then(
        response.status(200).json({
            mensagem : "Registro deletado com sucesso"
        })
    )
})

app.listen({
    port : 3000
})