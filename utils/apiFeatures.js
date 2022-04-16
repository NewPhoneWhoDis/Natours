class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        //* Basic filter feature query
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // using for each in order not to save new arr
        excludedFields.forEach(el => delete queryObj[el]);

        //* Advanced filter with gte, gt, lte, lt etc.
        // In the regular expression \b indicates that only these exact words must be matched
        // /g flag indicates that it will happen multiple times
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        // done on all other functions too in order to return the object and then be chained in tourController.js
        return this;
    }

    sort() {
        //* Sorting feature
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // sort by decending order if user does't add anything
            // will display the newest tours
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        //* Limiting the fields feature
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // exclude only the __v property
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        //* Pagination = allowing user to select specific page
        // 2 pages with 10 results per page would be: page 1: 1-10, page 2: 11-20 etc

        // setting default pagination
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;

        // calculate skip value
        // Formula if we want page 3(tours 21-30) we need the previous page times the limit
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}
module.exports = APIFeatures;