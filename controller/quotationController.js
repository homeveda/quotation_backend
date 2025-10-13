import Quotation from "../model/quotationModel";

const getQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find().populate('projectId');
        res.status(200).json({ quotations });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

const createQuotation = async (req, res) => {
    try {
        const { projectId, siteAddress, zone, category, items, totals, notes, status } = req.body;
        const newQuotation = new Quotation({
            projectId,
            siteAddress,
            zone,
            category,
            items,
            totals,
            notes,
            status
        });
        await newQuotation.save();
        res.status(201).json({ message: "Quotation created successfully", quotation: newQuotation });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};