"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var mongodb_1 = require("mongodb");
var PersistenceService = /** @class */ (function () {
    function PersistenceService() {
        console.log("MONGO DB");
        this.initClient();
        void this.check();
    }
    PersistenceService.prototype.initClient = function () {
        var MONGO_URL = this.errorWhenFalsy('MONGO_URL', process.env.MONGO_URL);
        var MONGO_USERNAME = this.errorWhenFalsy('MONGO_USERNAME', process.env.MONGO_USERNAME);
        var MONGO_PASSWORD = this.errorWhenFalsy('MONGO_PASSWORD', process.env.MONGO_PASSWORD);
        var dashIndex = MONGO_URL.indexOf('//');
        if (dashIndex < 0) {
            throw new Error("MONGO_URL \"".concat(MONGO_URL, "\" invalid!"));
        }
        var URI = "mongodb+srv://".concat(MONGO_USERNAME, ":").concat(MONGO_PASSWORD, "@").concat(MONGO_URL.substring(dashIndex + 2), "?retryWrites=true&w=majority");
        console.log(URI);
        this.client = new mongodb_1.MongoClient(URI);
    };
    ;
    PersistenceService.prototype.errorWhenFalsy = function (varName, value) {
        if (!value) {
            throw new Error("".concat(varName, " \"").concat(value, "\" falsy!"));
        }
        return value;
    };
    PersistenceService.prototype.check = function () {
        return __awaiter(this, void 0, void 0, function () {
            var MONGO_DATABASE;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, , 3, 5]);
                        return [4 /*yield*/, this.client.connect()];
                    case 1:
                        _a.sent();
                        MONGO_DATABASE = this.errorWhenFalsy('MONGO_DATABASE', process.env.MONGO_DATABASE);
                        return [4 /*yield*/, this.client.db(MONGO_DATABASE).command({ ping: 1 })];
                    case 2:
                        _a.sent();
                        console.log("Connected successfully to server");
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.client.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ;
    PersistenceService.prototype.create = function () {
        console.log("create");
    };
    return PersistenceService;
}());
exports["default"] = PersistenceService;
// interface Entity {
//     id: string
//     vocabulary: Vocabulary
//     canonicalLink: string
//     created: Date
//     lastModified: Date
//     label: string
//     description: string
//     externalResources: Array<any>
//     sameAs: Array<any>
//     data: Array<any>}
//
//
// interface Vocabulary {
//     id: string
//     created: Date
//     lastModified: Date
//     label: string
//     description: string
//     entityCount: number
// }
//
// function create(entity: Entity): Entity {
//     // check required properties to be valid
//     // add new entry for entity variable in DB
//     // Return new id (or whole entity object)
//     mongo.add(entity)
//
//
//     return entity
// }
//
// console.log("hello world")
