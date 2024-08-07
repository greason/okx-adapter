const assert = require("chai").assert;
const createRequest = require("../index.js").createRequest;

describe("createRequest", () => {
    const jobID = "278c97ffadb54a5bbb93cfec5f7b5503";

    context("when using the ordinals/collections endpoint", () => {
        const req = {
            id: jobID,
            endpoint: "ordinals/collections",
            data: {
                slug: "rune-stone",
                isBrc20: false
            }
        };

        it("returns the floorPrice", (done) => {
            createRequest(req, (statusCode, data) => {
                assert.equal(statusCode, 200);
                assert.equal(data.jobRunID, jobID);
                assert.isNotEmpty(data.data);
                console.log(JSON.stringify(data, null, 1));
                done();
            });
        });
    });
});
