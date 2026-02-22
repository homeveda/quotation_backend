import InitalLead from "../model/initalLeadModel.js";
import Architect from "../model/architectModel.js";
import { v4 as UUIDV4 } from "uuid";

// Silently attempt to register architect – ignores duplicates, never throws
const tryCreateArchitect = async ({ architectName, architectContact, architectAddress }) => {
  try {
    if (!architectName || !architectContact) return;
    const existing = await Architect.findOne({ architectName, architectContact });
    if (existing) return; // duplicate – skip
    await new Architect({ architectName, architectContact, architectAddress }).save();
  } catch (_) {
    // ignore any error so the lead operation is never blocked
  }
};

// Only super admin can see all leads
const SUPER_ADMIN_ROLE = 'super admin';

// Map requirement options to the admin role responsible for them
const REQUIREMENT_ROLE_MAP = {
  'Kitchen':  'kitchen sales executive',
  'Glass Work': 'glass sales executive',
  'Wardrobe': 'wardrobes sales executive',
  'Facade':   'facade sales executive',
};

// Derive which roles should see a lead based on its Requirements
const getAssignedRoles = (requirements = []) => {
  const roles = new Set();
  requirements.forEach((req) => {
    if (REQUIREMENT_ROLE_MAP[req]) roles.add(REQUIREMENT_ROLE_MAP[req]);
  });
  return Array.from(roles);
};

const createInitalLead = async (req, res) => {
  try {
    const { name, address, contactNumber, architectName, architectContact, architectAddress } = req.body;
    const requirements = req.body.Requirements || [];
    const visibleTo = Array.isArray(req.body.visibleTo) ? req.body.visibleTo : [];
      const newLead = new InitalLead({
      id: UUIDV4(),
      name,
      address,
      contactNumber,
      architectName,
      architectContact,
      architectAddress: architectAddress || req.body.architectCity,
        Requirements: requirements,
        category: req.body.category || [],
        assignedRoles: visibleTo,
      });
    await newLead.save();
    await tryCreateArchitect({ architectName, architectContact, architectAddress: architectAddress || req.body.architectCity });
    res
      .status(201)
      .json({ message: "Initial Lead created successfully", lead: newLead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllInitalLeads = async (req, res) => {
  try {
    const role = req.user?.role || '';

    let leads;
    if (role === SUPER_ADMIN_ROLE) {
      // super admin sees all leads
      leads = await InitalLead.find();
    } else {
      // every other admin only sees leads explicitly assigned to their role
      leads = await InitalLead.find({ assignedRoles: role });
    }

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
      const { id, name, address, contactNumber, architectName, architectContact, architectAddress } = req.body;
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
        const updatedArchitectName = architectName || lead.architectName;
        const updatedArchitectContact = architectContact || lead.architectContact;
        const updatedArchitectAddress = architectAddress || req.body.architectCity || lead.architectAddress;
        lead.architectName = updatedArchitectName;
        lead.architectContact = updatedArchitectContact;
        lead.architectAddress = updatedArchitectAddress;
        // If architect fields changed, try registering new architect silently
        if (architectName || architectContact) {
          await tryCreateArchitect({ architectName: updatedArchitectName, architectContact: updatedArchitectContact, architectAddress: updatedArchitectAddress });
        }
        const updatedRequirements = req.body.Requirements || lead.Requirements;
        lead.Requirements = updatedRequirements;
        lead.category = req.body.category || lead.category;
        lead.assignedRoles = Array.isArray(req.body.visibleTo) ? req.body.visibleTo : lead.assignedRoles;
        await lead.save();
        res.status(200).json({ message: "Initial Lead updated successfully", lead });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {getAllInitalLeads,getInitialLeadById,createInitalLead,deleteInitialLead,updateInitialLead};