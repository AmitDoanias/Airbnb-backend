const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {addReservation, getReservations} = require('./reservation')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getReservations)
router.post('/',  log, requireAuth, addReservation)
// router.delete('/:id',  requireAuth, deleteReview)

module.exports = router