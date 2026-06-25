export async function getNextSequence(gymId, counterName) {

    const counter = await counterModel.findOneAndUpdate(
        {gym: gymId, counterName},
        {$inc: {sequenceValue: 1}},
        {new: true, upsert: true}
    );

    return counter.sequenceValue;
}