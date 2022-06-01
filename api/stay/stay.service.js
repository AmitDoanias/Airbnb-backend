const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    // const criteria = _buildCriteria(filterBy)
    const criteria = {}

    try {
        const collection = await dbService.getCollection('stay')
        var stays = await collection.find(criteria).toArray()
        console.log('COLLLLsssatsatLLECT',collection);
        return stays

    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        const stay = collection.findOne({ _id: ObjectId(stayId) })
        return stay
    } catch (err) {
        logger.error(`while finding stay ${stayId}`, err)
        throw err
    }
}

async function remove(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.deleteOne({ _id: ObjectId(stayId) })
        return stayId
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}

async function add(stay) {
    try {
        const collection = await dbService.getCollection('stay')
        const res = await collection.insertOne(stay)
        return res.ops[0]
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}
async function update(stay) {
    try {
        var id = ObjectId(stay._id)
        delete stay._id
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: id }, { $set: { ...stay } })
        return stay
    } catch (err) {
        logger.error(`cannot update stay ${stayId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {

    // const criteria = {}
    // if (filterBy.name) {
    //     const regex = new RegExp(filterBy.name, 'i')
    //     criteria.name = { $regex: regex }
    // }
    // if (filterBy.inStock !== 'all') {
    //     (filterBy.inStock === 'inStock') ? criteria.inStock = true : criteria.inStock = false
    // }
    // if (filterBy.labels.length) {
    //     criteria.labels = { $all: [filterBy.labels] }
    //     console.log('criteria', criteria)
    //     console.log('labelsssssssss', filterBy.labels)
    // }
    // return criteria

}


module.exports = {
    remove,
    query,
    getById,
    add,
    update,
}