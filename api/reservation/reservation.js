const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const authService = require('../auth/auth.service')
const socketService = require('../../services/socket.service')
const reservationService = require('./reservation.service')

async function getReservations(req, res) {
    try {
        const reservations = await reservationService.query(req.query)
        console.log('GOT THE RESERVE',reservations);
        res.send(reservations)
    } catch (err) {
        logger.error('Cannot get reservations', err)
        res.status(500).send({ err: 'Failed to get reservations' })
    }
}

// async function deletereservation(req, res) {
//     try {
//         const deletedCount = await reservationService.remove(req.params.id)
//         if (deletedCount === 1) {
//             res.send({ msg: 'Deleted successfully' })
//         } else {
//             res.status(400).send({ err: 'Cannot remove reservation' })
//         }
//     } catch (err) {
//         logger.error('Failed to delete reservation', err)
//         res.status(500).send({ err: 'Failed to delete reservation' })
//     }
// }


async function addReservation(req, res) {

    var loggedinUser = authService.validateToken(req.cookies.loginToken)
 
    try {
        var reservation = req.body
        reservation.buyerId = loggedinUser._id
        reservation = await reservationService.add(reservation)

        // socketService.broadcast({type: 'reservation-added', data: reservation, userId: reservation.buyerId})
        // socketService.emitToUser({type: 'reservation-about-you', data: reservation, userId: reservation.aboutUserId})
        
        // const fullUser = await userService.getById(loggedinUser._id)
        // socketService.emitTo({type: 'user-updated', data: fullUser, label: fullUser._id})

        res.send(reservation)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add reservation', err)
        res.status(500).send({ err: 'Failed to add reservation' })
    }
}

module.exports = {
    getReservations,
    addReservation
    // deletereservation,
}