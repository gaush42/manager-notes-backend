const express = require('express')
const router = express.Router()
const notesController = require('../controllers/notesController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(notesController.getAllNotes)
    .post(notesController.createNewNotes)
    .patch(notesController.updateNote)
    .delete(notesController.deleteNote)

module.exports = router