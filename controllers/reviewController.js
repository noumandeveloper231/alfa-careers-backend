import reviewModel from "../models/reviewModel.js"

export const addReview = async (req, res) => {
    const { name, review, rating, profilePicture } = req.body

    if (!name || !review || !rating || !profilePicture) {
        return res.status(400).json({ message: 'Please provide all fields' })
    }

    try {
        await reviewModel.create({ name, review, rating, profilePicture })

        return res.json({ success: true, message: 'Review added successfully' })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const getReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.find()

        console.log(reviews);
        return res.json({ success: true, reviews })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const getRatingAnalytics = async (req, res) => {
    try {
        const totalReviews = await reviewModel.countDocuments(); // 70
        const fiveStars = await reviewModel.countDocuments({ rating: 5 }); // 20
        const fourStars = await reviewModel.countDocuments({ rating: 4 }); // 30 
        const threeStars = await reviewModel.countDocuments({ rating: 3 }); // 5
        const twoStars = await reviewModel.countDocuments({ rating: 2 }); // 15
        const oneStar = await reviewModel.countDocuments({ rating: 1 }); // 0

        const averageRating =
            Number((totalReviews === 0
                ? 0
                : (fiveStars * 5 +
                    fourStars * 4 +
                    threeStars * 3 +
                    twoStars * 2 +
                    oneStar * 1) / totalReviews).toFixed(1))

        return res.json({ success: true, data: { totalReviews, averageRating, fiveStars, fourStars, threeStars, twoStars, oneStar } });
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}