const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const Note = require('../models/Note')

// @desc Get all notes
// @route Get /notes
// @access Private

const getAllNotes = asyncHandler(async(req, res)=>{
    //Get al notes from MongoDB
    const notes = await Note.find().lean()

    //if no Notes found
    if(!notes?.length){
        return res.status(400).json({message: 'No notes found'})
    }
    //Add username to each notes before sending the response
    const notesWithUser = await Promise.all(notes.map(async(note) =>
    {
        const user = await User.findById(note.user).lean().exec()
        return {...note, username: user.username}
    }))
    res.json(notesWithUser)
})

//@desc Create new Notes
//@route POST /notes
//@access Private
const createNewNotes = asyncHandler(async (req, res) => {
    const {user, title, text} = req.body;

    //Confir data
    if(!user || !title || !text){
        return res.status(400).json({
            message: 'All fields are required'
        })
    }

    //Check for duplicate title
    const duplicate = await Note.findOne({title}).lean().exec()

    if(duplicate){
        return res.status(409).json({
            message: 'Duplicate Notes Tiltle'
        })
    }

    //Create and store New Notes
    const note = await Note.create({user, title, text})
    if(note){
        return res.status(201).json({
            message: 'New Note created'
        })
    }else{
        return res.status(400).json({
            message: 'Invalid Note data received'
        })
    }
})

//@desc Update Notes
//@route PATCH /notes
//@access Private
const updateNote = asyncHandler(async(re, res)=>{
    const { id, user, title, text, completed }  = req.body;

    //confirm data
    if(!id || !user || !title || !text || typeof completed !== 'boolean'){
        res.status(400).json({
            message: 'All fields are required'
        })
    }

    //confirm note exists to update
    const note = await Note.findById(id).exec()

    if(!note){
        return res.status(400).json({
            message: 'Note not found'
        })
    }

    //Check for duplicate title
    const duplicate = await Note.findOne({title}).lean().exec()

    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({
            message: 'Duplicate note title'
        })
    }

    note.user = user
    note. title = title
    note.text = text
    note.completed = completed

    const updateNote = await note.save()
    res.json(`'${updateNote.title}' updated`)

})

//@desc Delete Note
//@route Delete /note
//@access Private
const deleteNote = asyncHandler(async(req, res) => {
    const { id } = req.body;

    //Confirm data
    if(!id){
        return res.status(400).json({
            message: 'Note ID required'
        })
    }

    //Confirm note exist to delete
    const note = await Note.findById(id).exec()

    if(!note){
        return res.status(400).json({
            message: 'Note not found'
        })
    }

    const result = await note.deleteOne()
    res.json(`Note '${result.title}' with ID ${result._id} deleted`)

})

module.exports = {
    getAllNotes,
    createNewNotes,
    updateNote,
    deleteNote
}