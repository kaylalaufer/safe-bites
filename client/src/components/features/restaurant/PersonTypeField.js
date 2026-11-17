import { PERSON_TYPES } from "../../../domain";

const PersonTypeField = ({ value, onChange }) => {
  return (
    <div>
      <h3 className="font-medium mb-2">I am a(n): *</h3>
      <select
        name="person_type"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Type</option>
        {PERSON_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PersonTypeField;
