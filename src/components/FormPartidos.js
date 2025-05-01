import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { db, auth } from "./firebase";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import "../styles/FromPartidos.css"
const FormPartido = () => {
    const { state } = useLocation();
    const { partido } = state || {};
    const { torneoId } = useParams();
    const navigate = useNavigate();

    const [equipos, setEquipos] = useState([]);
    const [formData, setFormData] = useState({
        equipo1: partido?.equipo1 || null,
        equipo2: partido?.equipo2 || null,
        golesEquipo1: partido?.golesEquipo1 || 0,
        golesEquipo2: partido?.golesEquipo2 || 0,
        ubicacion: partido?.ubicacion || "",
        fecha: partido?.fecha || new Date().toISOString().split('T')[0],
        estado: partido?.estado || "pendiente"
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchEquipos = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
            const equiposSnap = await getDocs(
            collection(db, `Users/${userId}/Torneos/${torneoId}/Equipos`)
            );
            const equiposData = equiposSnap.docs.map((doc) => {
            const data = doc.data();
                return {
                    id: doc.id,
                    nombre: data.nombre || data.nombre_equipo || "Equipo sin nombre",
                    ...data, 
                };
            });
            setEquipos(equiposData);
        } catch (err) {
            console.error("❌ Error obteniendo equipos:", err);
        }
        };

        fetchEquipos();
    }, [torneoId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectEquipo = (equipo, field) => {
        setFormData((prev) => ({ ...prev, [field]: equipo }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.equipo1) newErrors.equipo1 = "Selecciona el equipo local";
        if (!formData.equipo2) newErrors.equipo2 = "Selecciona el equipo visitante";
        if (formData.equipo1?.id === formData.equipo2?.id)
        newErrors.equipo2 = "Los equipos deben ser diferentes";
        if (!formData.fecha) newErrors.fecha = "Ingresa una fecha válida";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            alert("Debes iniciar sesión");
            return;
        }

        const partidoData = {
            equipo1: formData.equipo1,
            equipo2: formData.equipo2,
            golesEquipo1: Number(formData.golesEquipo1),
            golesEquipo2: Number(formData.golesEquipo2),
            ubicacion: formData.ubicacion || "Por definir",
            fecha: formData.fecha,
            estado: formData.estado,
        };

        const partidoRef = partido?.id
            ? doc(db, `Users/${userId}/Torneos/${torneoId}/Partidos`, partido.id)
            : doc(collection(db, `Users/${userId}/Torneos/${torneoId}/Partidos`));

        await setDoc(partidoRef, { ...partidoData, id: partidoRef.id });

        alert("✅ Partido guardado correctamente");
        navigate(-1);
        } catch (error) {
        console.error("❌ Error al guardar el partido:", error);
        alert("❌ Ocurrió un error al guardar");
        }
    };

    return (
        <div className="form-partido-container">
        <h2>{partido?.id ? "Editar Partido" : "Crear Nuevo Partido"}</h2>

        <form onSubmit={handleSubmit}>
            <div className="form-group">
            <label>Equipo Local:</label>
            <select
                value={formData.equipo1?.id || ""}
                onChange={(e) =>
                handleSelectEquipo(equipos.find((eq) => eq.id === e.target.value), "equipo1")
                }
                className={errors.equipo1 ? "error" : ""}
            >
                <option value="">Selecciona un equipo</option>
                {equipos.map((equipo) => (
                <option key={equipo.id} value={equipo.id} disabled={equipo.id === formData.equipo2?.id}>
                    {equipo.nombre}
                </option>
                ))}
            </select>
            {errors.equipo1 && <span className="error-message">{errors.equipo1}</span>}
            </div>

            <div className="form-group">
            <label>Equipo Visitante:</label>
            <select
                value={formData.equipo2?.id || ""}
                onChange={(e) =>
                handleSelectEquipo(equipos.find((eq) => eq.id === e.target.value), "equipo2")
                }
                className={errors.equipo2 ? "error" : ""}
            >
                <option value="">Selecciona un equipo</option>
                {equipos.map((equipo) => (
                <option key={equipo.id} value={equipo.id} disabled={equipo.id === formData.equipo1?.id}>
                    {equipo.nombre}
                </option>
                ))}
            </select>
            {errors.equipo2 && <span className="error-message">{errors.equipo2}</span>}
            </div>

            <div className="form-group">
            <label>Goles Equipo Local:</label>
            <input
                type="number"
                name="golesEquipo1"
                value={formData.golesEquipo1}
                onChange={handleChange}
                min="0"
            />
            </div>

            <div className="form-group">
            <label>Goles Equipo Visitante:</label>
            <input
                type="number"
                name="golesEquipo2"
                value={formData.golesEquipo2}
                onChange={handleChange}
                min="0"
            />
            </div>

            <div className="form-group">
            <label>Ubicación:</label>
            <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Por definir"
            />
            </div>

            <div className="form-group">
            <label>Fecha:</label>
            <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className={errors.fecha ? "error" : ""}
            />
            {errors.fecha && <span className="error-message">{errors.fecha}</span>}
            </div>

            <div className="form-group">
            <label>Estado:</label>
            <select name="estado" value={formData.estado} onChange={handleChange}>
                <option value="pendiente">Pendiente</option>
                <option value="jugando">En juego</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
            </select>
            </div>

            <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)}>
                Cancelar
            </button>
            <button type="submit">Guardar Partido</button>
            </div>
        </form>
        </div>
    );
};

export default FormPartido;
