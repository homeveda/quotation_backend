import InitalLead from "../model/initalLeadModel.js";
import { v4 as UUIDV4 } from "uuid";

const createInitalLead = async (req, res) => {
  try {
    const { name, address, contactNumber, architectStatus, architectName, architectContact, architectCity, leadStatus } = req.body;
    const newLead = new InitalLead({
      id: UUIDV4(),
      name,
      address,
      contactNumber,
      architectStatus,
      architectName,
      architectContact,
      architectCity,
      leadStatus: leadStatus || "New",
    });
    await newLead.save();
    res
      .status(201)
      .json({ message: "Initial Lead created successfully", lead: newLead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllInitalLeads = async (req, res) => {
  try {
    const leads = await InitalLead.find();
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInitialLeadById = async (req, res) => {
  try {
    const leadId = req.params.id;
    const lead = await InitalLead.findOne({ id: leadId });
    if (!lead) {
      return res.status(404).json({ message: "Initial Lead not found" });
    }
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteInitialLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const deletedLead = await InitalLead.findOneAndDelete({ id: leadId });
    if (!deletedLead) {
      return res.status(404).json({ message: "Initial Lead not found" });
    }
    res.status(200).json({ message: "Initial Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateInitialLead = async (req, res) => {
    try {
        const { id, name, address, contactNumber, architectStatus, architectName, architectContact, architectCity, leadStatus } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Lead id is required" });
        }
        const lead = await InitalLead.findOne({ id });
        if (!lead) {
            return res.status(404).json({ message: "Initial Lead not found" });
        }
        lead.name = name || lead.name;
        lead.address = address || lead.address;
        lead.contactNumber = contactNumber || lead.contactNumber;
        lead.architectStatus = architectStatus || lead.architectStatus;
        lead.architectName = architectName || lead.architectName;
        lead.architectContact = architectContact || lead.architectContact;
        lead.architectCity = architectCity || lead.architectCity;
        lead.leadStatus = leadStatus || lead.leadStatus;
        await lead.save();
        res.status(200).json({ message: "Initial Lead updated successfully", lead });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {getAllInitalLeads,getInitialLeadById,createInitalLead,deleteInitialLead,updateInitialLead};