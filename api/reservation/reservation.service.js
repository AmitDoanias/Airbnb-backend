const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('reservation')
        // const reservations = await collection.find(criteria).toArray()
        var reservations = await collection.aggregate([
            {
                $match: criteria
            },
            {
                $lookup:
                {
                    localField: 'byUserId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'byUser'
                }
            },
            {
                $unwind: '$byUser'
            },
            {
                $lookup:
                {
                    localField: 'aboutUserId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'aboutUser'
                }
            },
            {
                $unwind: '$aboutUser'
            }
        ]).toArray()
        reservations = reservations.map(reservation => {
            reservation.byUser = { _id: reservation.byUser._id, fullname: reservation.byUser.fullname }
            reservation.aboutUser = { _id: reservation.aboutUser._id, fullname: reservation.aboutUser.fullname }
            delete reservation.byUserId
            delete reservation.aboutUserId
            return reservation
        })

        return reservations
    } catch (err) {
        logger.error('cannot find reservations', err)
        throw err
    }

}

async function remove(reservationId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('reservation')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(reservationId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const {deletedCount} = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove reservation ${reservationId}`, err)
        throw err
    }
}


async function add(reservation) {
    try {
        // in case of ARRGATION
        // const reservationToAdd = {
        //     ...reservation,
        //     buyerId: ObjectId(reservation.buyerId),
        //     buyerId: ObjectId(reservation.buyerId),
        //     buyerId: ObjectId(reservation.buyerId) 
        // }

        const collection = await dbService.getCollection('reservation')
        await collection.insertOne(reservation)
        return reservation
    } catch (err) {
        logger.error('cannot book reservation', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.byUserId) criteria.byUserId = filterBy.byUserId
    return criteria
}

module.exports = {
    query,
    remove,
    add
}


