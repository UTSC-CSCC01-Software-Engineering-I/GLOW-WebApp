// __tests__/pointController.test.js
const {
    addPoint,
    getPoints,
    getUserPoints,
    editPoint,
    deletePoint
} = require('../controllers/pointController');
const User = require('../models/User');
const Point = require('../models/pointsModel');
  
jest.mock('../models/User');
jest.mock('../models/pointsModel');

describe('pointController', () => {
    let req, res, selectMock;

    beforeEach(() => {
        req = { body: {}, params: {}, userId: 'u123' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
  
        // reset all mocks
        User.findById.mockReset();
        Point.find.mockReset();
        Point.findOne.mockReset();
        Point.findOneAndDelete.mockReset();
        Point.mockClear();
    
        // default: findById().select('email') resolves to a fake user
        selectMock = jest.fn().mockResolvedValue({ _id: 'u123', email: 'foo@bar.com' });
        User.findById.mockReturnValue({ select: selectMock });
    });
  
    describe('addPoint', () => {
        it('400 if any field is missing', async () => {
            req.body = { lat: 1.0, lon: 2.0 }; // missing temp
            await addPoint(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
        });
  
        it('404 if user not found', async () => {
            req.body = { lat:1, lon:2, temp:3 };
            // each test gets its own select-mock
            const userSelect = jest.fn().mockResolvedValue(null);
            User.findById.mockReturnValue({ select: userSelect });
    
            await addPoint(req, res);
            expect(User.findById).toHaveBeenCalledWith('u123');
            expect(userSelect).toHaveBeenCalledWith('email');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
            
  
        it('201 and point on success', async () => {
            req.body = { lat:1, lon:2, temp:3 };
            // mock Point constructor
            const fakePoint = { lat:1, lon:2, temp:3, user:{ id:'u123', email:'foo@bar.com' }, save: jest.fn() };
            Point.mockImplementation(() => fakePoint);
    
            await addPoint(req, res);
    
            expect(fakePoint.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
            message: 'Point added successfully',
            point: fakePoint
            });
        });
  
        it('500 on save() error', async () => {
            req.body = { lat:1, lon:2, temp:3 };
            const badPoint = { save: jest.fn().mockRejectedValue(new Error('fail')) };
            Point.mockImplementation(() => badPoint);
            console.error = jest.fn();
    
            await addPoint(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });
  
    describe('getPoints', () => {
        it('returns all points with source:user', async () => {
            const docs = [
                { toObject: () => ({ foo: 'bar' }) },
                { toObject: () => ({ baz: 'qux' }) }
            ];
            Point.find.mockResolvedValue(docs);
    
            await getPoints(req, res);
    
            expect(Point.find).toHaveBeenCalledWith({});
            expect(res.json).toHaveBeenCalledWith({
                items: [
                    { foo: 'bar', source: 'user' },
                    { baz: 'qux', source: 'user' }
                ]
            });
        });
  
        it('500 on db error', async () => {
            Point.find.mockRejectedValue(new Error('oops'));
            console.error = jest.fn();
    
            await getPoints(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });
  
    describe('getUserPoints', () => {
        it('404 when user missing', async () => {
            // simulate findById().select rejecting to no user
            User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    
            await getUserPoints(req, res);
    
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });
  
      it('returns only this user’s points', async () => {
            const dbPoints = [
                { _id:'1', lat:1, lon:2, temp:3, createdAt:'ts1' },
                { _id:'2', lat:4, lon:5, temp:6, createdAt:'ts2' }
            ];
            Point.find.mockResolvedValue(dbPoints);
    
            await getUserPoints(req, res);
    
            expect(Point.find).toHaveBeenCalledWith({ 'user.email':'foo@bar.com' });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: [
                    { _id:'1', lat:1, lon:2, temp:3, timestamp:'ts1', source:'user' },
                    { _id:'2', lat:4, lon:5, temp:6, timestamp:'ts2', source:'user' }
                ]
            });
        });
  
        it('500 on db error', async () => {
            // simulate error in findById.select
            User.findById.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('DB error')) });
            console.error = jest.fn();
    
            await getUserPoints(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error'
            });
        });
    });
  
    describe('editPoint', () => {
        beforeEach(() => {
            req.params.pointId = 'p1';
        });
    
        it('400 if fields missing', async () => {
            req.body = { lat:1, lon:2 }; // missing temp
            await editPoint(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Missing required fields: lat, lon, temp'
            });
        });
  
        it('404 if user not found', async () => {
            req.body = { lat:1, lon:2, temp:3 };
            User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    
            await editPoint(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });
  
        it('404 if point not found or wrong owner', async () => {
            req.body = { lat:1, lon:2, temp:3 };
            Point.findOne.mockResolvedValue(null);
    
            await editPoint(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Point not found or you do not have permission to edit it'
            });
        });
  
        it('updates and returns success', async () => {
            req.body = { lat:1, lon:2, temp:3 };
            const found = {
                _id: 'p1',
                lat: 9, lon: 9, temp: 9,
                createdAt: 'ts',
                save: jest.fn()
            };
            Point.findOne.mockResolvedValue(found);
    
            await editPoint(req, res);
    
            expect(found.lat).toBe(1);
            expect(found.lon).toBe(2);
            expect(found.temp).toBe(3);
            expect(found.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Point updated successfully',
                point: {
                    _id:'p1', lat:1, lon:2, temp:3,
                    timestamp:'ts', source:'user'
                }
            });
        });
  
        it('handles errors with 500', async () => {
            // must supply body so we don't hit the 400-missing-fields branch
            req.body = { lat:1, lon:2, temp:3 };
            const userSelect = jest.fn().mockRejectedValue(new Error('err'));
            User.findById.mockReturnValue({ select: userSelect });
            console.error = jest.fn();
    
            await editPoint(req, res);
            expect(userSelect).toHaveBeenCalledWith('email');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error'
            });
        });
    });
  
    describe('deletePoint', () => {
        beforeEach(() => {
            req.params.pointId = 'p1';
        });
  
        it('404 if user not found', async () => {
            User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
            await deletePoint(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });
  
        it('404 if point not found or wrong owner', async () => {
            Point.findOneAndDelete.mockResolvedValue(null);
            await deletePoint(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Point not found or you do not have permission to delete it'
            });
        });
  
        it('deletes and returns success', async () => {
            Point.findOneAndDelete.mockResolvedValue({});
            await deletePoint(req, res);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Point deleted successfully'
            });
        });
  
        it('500 on error', async () => {
            User.findById.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('err')) });
            console.error = jest.fn();
    
            await deletePoint(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error'
            });
        });
    });
});