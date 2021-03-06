'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const { Students } = require('./models');

const passport = require('passport');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();
const { localAuth, createAuthToken } = require('../authConfig')

router.use(bodyParser.json());

router.get('/user/:userId', (req, res) => {
  Students
    .find({userId: req.params.userId})
    .then(students => {
      res.json({
        students: students.map(
          (students) => students.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


router.get('/:id', (req, res) => {
  console.log(res.body)
  Students
    .findById(req.params.id)
    .then(student => {
      res.json({
        student: student.serialize()
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    })
});


router.post('/', (req, res) => {

  const requiredFields = ['userId', 'name'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Students
    .create({
      userId: req.body.userId,
      referenceId: req.body.referenceId,
      name: req.body.name,
      nickName: req.body.nickName,
      notes: req.body.notes,
      pronoun: req.body.pronoun
    })
    .then(students => res.status(201).json(students.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


router.put('/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({ message: message });
  }
  
  const toUpdate = {};
  const updateableFields = ['name', 'nickName', 'pronoun', 'notes', 'referenceId'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Students
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(students => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

router.delete('/:id', (req, res) => {
  Students
    .findByIdAndRemove(req.params.id)
    .then(students => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

module.exports = { router };