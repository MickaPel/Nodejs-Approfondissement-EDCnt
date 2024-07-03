const UnauthorizedError = require("../../errors/unauthorized");
const articlesService = require("./articles.service");

class ArticleController {
    async create(req, res, next) {
        try {
            const user = req.user;
            const data = req.body;
            data.user = user.id;
            const article = await articlesService.create(data)
            req.io.emit("article:create", article);
            res.status(201).json({article,user});
        } catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const user = req.user;
            if (user.role !== "admin") {
                throw new UnauthorizedError();
            }
            const id = req.params.id;
            const data = req.body
            const updateArticle = await articlesService.update(id, data);
            req.io.emit("article:update", updateArticle);
            res.json(updateArticle);
        } catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const user = req.user;
            if (user.role !== "admin") {
                throw new UnauthorizedError();
            }
            const id = req.params.id;
            await articlesService.delete(id);
            req.io.emit("article:delete", { id });
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ArticleController();