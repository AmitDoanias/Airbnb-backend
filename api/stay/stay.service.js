const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    console.log('FilterBy', filterBy);
    const criteria = _buildCriteria(filterBy)
    // const criteria = { "address.country": "Italy" }

    try {
        const collection = await dbService.getCollection('stay')
        var stays = await collection.find(criteria).toArray()
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
        logger.error(`cannot update stay ${stay._id}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {

    const { category, searchBy, properties } = filterBy
    const criteria = {}
    

    if (category) criteria.category = category

    const newSearchBy = JSON.parse(searchBy)

    const  {location,guestsNum, dates}=newSearchBy
    if (location) {
        const regex = new RegExp(newSearchBy.location, 'i')
        criteria['address.country'] = {$regex: regex }
        // criteria.address = {$regex: regex }
        // criteria["address.city"] = {$regex: regex }
        // criteria["address.region"] = {$regex: regex }
    }
    if (guestsNum >1){
        criteria.guests = {$gte:guestsNum }
    }
    
    const newProperties = JSON.parse(properties)
    
    const { price, beds, roomType, amenities } = newProperties
    
    if (beds){
        criteria.bedrooms = {$gte:beds }
    }
    if (roomType['Entire place']){
        criteria.roomType = 'Entire Place'
    }else if (roomType['Private room']){
        criteria.roomType = 'Private room'
    }else if (roomType['Shared room']){
        criteria.roomType = 'Shared room'
    }

    let amenitiesKeys = Object.keys(amenities)
    let filterdAmenities = []
    amenitiesKeys.forEach(amenitie => {
        if (amenities[amenitie]) {
            filterdAmenities.push(amenitie)
        }
    })

    if (filterdAmenities.length) {
        criteria.amenities = { $all: filterdAmenities }
    }




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
    return criteria

}


module.exports = {
    remove,
    query,
    getById,
    add,
    update,
}