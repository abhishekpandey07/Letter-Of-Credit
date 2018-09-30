const express = require('express');
const router = express.Router();
const lcRouter = require('./lcs');
const bankRouter = require('./banks');
const supplierRouter = require('./suppliers');
const projectRouter = require('./projects');
const infoRouter = require('./info');
const userRouter = require('./users');


router.use('/lcs',lcRouter);
router.use('/banks',bankRouter);
router.use('/info',infoRouter);
router.use('/suppliers',supplierRouter);
router.use('/projects',projectRouter);
router.use('/users',userRouter);

module.exports = router;

