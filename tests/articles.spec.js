const request = require("supertest");
const { app } = require("../server");
const jwt = require("jsonwebtoken");
const config = require("../config");
const mongoose = require("mongoose");
const mockingoose = require("mockingoose");
const User = require("../api/users/users.model");
const usersService = require("../api/users/users.service");
const articlesSchema = require("../api/articles/articles.schema");

describe("tester API articles", () => {
    let token;
    const FAKE_ID = "fake";
    const MOCK_USER = {
        _id: FAKE_ID,
        name: "ana",
        email: "nfegeg@gmail.com",
        password: "azertyuiop",
        role: "admin"
    };
    const MOCK_DATA_CREATED = {
        id: FAKE_ID,
        title: "article 9",
        content: "contenu article",
        user: FAKE_ID,
        status: "draft"
    };
    const MOCK_DATA_UPDATE = {
        id: FAKE_ID,
        title: "article 9",
        content: "contenu article modifié",
        user: FAKE_ID,
        status: "draft"
    };

    beforeEach(() => {
        token = jwt.sign({ userId: FAKE_ID }, config.secretJwtToken);
        //Comme j'ai changé le middleware d'authentification, j'ai mocké la méthode get de usersService pour qu'il me retourne un utilisateur, sinon les tests ne passent pas
        jest.spyOn(usersService, 'get').mockResolvedValue(MOCK_USER);
        mockingoose(articlesSchema).toReturn(MOCK_DATA_CREATED, "save");
        mockingoose(articlesSchema).toReturn(MOCK_DATA_UPDATE, "findOneAndUpdate");
        mockingoose(articlesSchema).toReturn({}, "deleteOne");
    });

    test("[Articles] Create Article", async () => {
        const res = await request(app)
            .post("/api/articles")
            .send(MOCK_DATA_CREATED)
            .set("x-access-token", token);
        expect(res.status).toBe(201);
        expect(res.body.article.title).toBe(MOCK_DATA_CREATED.title);
    });
    test("[Articles] Update Article", async () => {
        const res = await request(app)
            .put("/api/articles/fake_id")
            .send(MOCK_DATA_UPDATE)
            .set("x-access-token", token)
        expect(res.status).toBe(200);
        expect(res.body.content).toBe(MOCK_DATA_UPDATE.content);
    });
    test("[Articles] Delete Article", async () => {
        const res = await request(app)
            .delete("/api/articles/fake_id")
            .set("x-access-token", token)
        expect(res.status).toBe(204);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });
});
