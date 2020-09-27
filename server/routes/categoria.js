const { json } = require('body-parser');
const express = require('express');
const _ = require('underscore');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

const Categoria = require('../models/categoria');
const Usuario = require('../models/usuario');

// ============================
// Mostrar todas las categorías
// ============================

app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({ estado: true })
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments({ estado: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });

            });

        });

});

// ============================
// Mostrar una categoría por ID
// ============================

app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

    // Categoria.findById(...);

});

// ============================
// Crear nueva categoria
// ============================

app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id,
        estado: true
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
    // regresa la nueva categoria
    // req.usuario._id

});

// ============================
// Actualizar categoria por ID
// ============================

app.put('/categoria/:id', verificaToken, function(req, res) {

    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


// ============================
// Borrar categoría por ID
// ============================

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }
        res.json({
            ok: true,
            message: 'Categoria borrada'
        })
    });
    // Solo un administrador puede borrar categorias
});

module.exports = app;