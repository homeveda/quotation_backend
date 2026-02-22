import Architect from "../model/architectModel.js";

const createArchitect = async (req, res) => {
  try {
    const { architectName, architectContact, architectAddress } = req.body;

    const existing = await Architect.findOne({ architectName, architectContact });
    if (existing) {
      return res.status(409).json({ message: "Architect with the same name and contact number already exists" });
    }

    const newArchitect = new Architect({
      architectName,
      architectContact,
      architectAddress,
    });
    await newArchitect.save();
    res.status(201).json({ message: "Architect created successfully", architect: newArchitect });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllArchitects = async (req, res) => {
  try {
    const architects = await Architect.find();
    res.status(200).json(architects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getArchitectById = async (req, res) => {
  try {
    const architect = await Architect.findById(req.params.id);
    if (!architect) {
      return res.status(404).json({ message: "Architect not found" });
    }
    res.status(200).json(architect);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateArchitect = async (req, res) => {
  try {
    const { architectName, architectContact, architectAddress } = req.body;
    const architect = await Architect.findById(req.params.id);
    if (!architect) {
      return res.status(404).json({ message: "Architect not found" });
    }
    architect.architectName = architectName || architect.architectName;
    architect.architectContact = architectContact || architect.architectContact;
    architect.architectAddress = architectAddress || architect.architectAddress;
    await architect.save();
    res.status(200).json({ message: "Architect updated successfully", architect });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteArchitect = async (req, res) => {
  try {
    const architect = await Architect.findByIdAndDelete(req.params.id);
    if (!architect) {
      return res.status(404).json({ message: "Architect not found" });
    }
    res.status(200).json({ message: "Architect deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createArchitect, getAllArchitects, getArchitectById, updateArchitect, deleteArchitect };
