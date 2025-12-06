import Quotation from "../model/quotationModel.js";
import Project from "../model/projectModel.js";

// Helper to safely parse JSON fields that may come as strings (e.g., from multipart)
const parseJSONField = (field) => {
    if (field === undefined) return undefined;
    if (typeof field !== 'string') return field;
    const trimmed = field.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try { return JSON.parse(trimmed); } catch (e) { return field; }
    }
    return field;
}

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

// Create a new quotation. Calculates totals from items.
const createQuotation = async (req, res) => {
    try {
        const { projectId, siteAddress, category, notes } = req.body;
        let items = parseJSONField(req.body.items);
        let rawTotals = parseJSONField(req.body.totals) || {};

        if (!projectId) return res.status(400).json({ message: "projectId is required" });

        // Verify project exists
        const projectExists = await Project.findOne({ id: projectId });
        if (!projectExists) return res.status(400).json({ message: "Invalid projectId" });

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "`items` array is required and cannot be empty" });
        }

        // Normalize items and compute totalPrice if missing
        let grossAmount = 0;
        const normalizedItems = items.map((it) => {
            const name = it.name;
            const quantity = Number(it.quantity) || 0;
            const price = Number(it.price) || 0;
            let totalPrice = Number(it.totalPrice);
            if (!totalPrice || totalPrice === 0) totalPrice = quantity * price;
            grossAmount += totalPrice;
            return {
                name,
                floor: it.floor,
                area: it.area,
                quantity,
                price,
                totalPrice,
                workType: it.workType
            };
        });

        const discount = Number(rawTotals.discount) || 0;
        const taxAmount = Number(rawTotals.taxAmount) || 0;
        const freightInstallationHandling = Number(rawTotals.freightInstallationHandling) || 0;
        const grandTotal = grossAmount - discount + taxAmount + freightInstallationHandling;

        const quotation = new Quotation({
            projectId,
            siteAddress,
            category,
            items: normalizedItems,
            totals: {
                grossAmount,
                discount,
                taxAmount,
                freightInstallationHandling,
                grandTotal
            },
            notes
        });

        await quotation.save();
        res.status(201).json({ message: "Quotation created", quotation });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update an existing quotation. Recalculates totals when items are updated.
const updateQuotation = async (req, res) => {
    try {
        const { id } = req.params; // quotation _id (Mongo)
        if (!id) return res.status(400).json({ message: "Quotation id is required in params" });

        const quotation = await Quotation.findById(id);
        if (!quotation) return res.status(404).json({ message: "Quotation not found" });

        const { siteAddress, category, notes } = req.body;
        let items = parseJSONField(req.body.items);
        let rawTotals = parseJSONField(req.body.totals);

        if (siteAddress !== undefined) quotation.siteAddress = siteAddress;
        if (category !== undefined) quotation.category = category;
        if (notes !== undefined) quotation.notes = notes;

        if (items !== undefined) {
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ message: "`items` must be a non-empty array when provided" });
            }

            let grossAmount = 0;
            const normalizedItems = items.map((it) => {
                const name = it.name;
                const quantity = Number(it.quantity) || 0;
                const price = Number(it.price) || 0;
                let totalPrice = Number(it.totalPrice);
                if (!totalPrice || totalPrice === 0) totalPrice = quantity * price;
                grossAmount += totalPrice;
                return {
                    name,
                    floor: it.floor,
                    area: it.area,
                    quantity,
                    price,
                    totalPrice,
                    workType: it.workType
                };
            });
            quotation.items = normalizedItems;

            // Recompute totals using provided rawTotals or previous values
            const discount = (rawTotals && Number(rawTotals.discount)) || quotation.totals.discount || 0;
            const taxAmount = (rawTotals && Number(rawTotals.taxAmount)) || quotation.totals.taxAmount || 0;
            const freightInstallationHandling = (rawTotals && Number(rawTotals.freightInstallationHandling)) || quotation.totals.freightInstallationHandling || 0;
            const grandTotal = grossAmount - discount + taxAmount + freightInstallationHandling;

            quotation.totals = {
                grossAmount,
                discount,
                taxAmount,
                freightInstallationHandling,
                grandTotal
            };
        } else if (rawTotals !== undefined) {
            // If only totals provided, allow updating discount/tax/freight and recompute grandTotal
            const grossAmount = quotation.totals.grossAmount || 0;
            const discount = Number(rawTotals.discount) || quotation.totals.discount || 0;
            const taxAmount = Number(rawTotals.taxAmount) || quotation.totals.taxAmount || 0;
            const freightInstallationHandling = Number(rawTotals.freightInstallationHandling) || quotation.totals.freightInstallationHandling || 0;
            const grandTotal = grossAmount - discount + taxAmount + freightInstallationHandling;
            quotation.totals = {
                grossAmount,
                discount,
                taxAmount,
                freightInstallationHandling,
                grandTotal
            };
        }

        await quotation.save();
        res.status(200).json({ message: "Quotation updated", quotation });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete a quotation by its Mongo _id (in params)
const deleteQuotation = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Quotation id is required in params" });
        const deleted = await Quotation.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Quotation not found" });
        res.status(200).json({ message: "Quotation deleted", quotation: deleted });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export { getQuotations, createQuotation, updateQuotation, deleteQuotation };

