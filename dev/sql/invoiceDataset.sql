SELECT TOP 100
    h.ID, h.Cislo, h.VarSym, h.Datum, h.DatUcP, h.DatSplat, h.DatZdPln, h.DatObj,  
    h.Kc0, h.Kc1, h.KcDPH1, h.Kc2, h.KcDPH2, h.Kc3, h.KcDPH3, h.KcCelkem, h.KcZaokr,  
    h.RefCM, h.DenEUR, h.CmMnoz, h.CmKurs, h.Cm0, h.CmZaloha, h.CmCelkem, h.CmLikv, 
    h.CmU, h.CmZaokr, h.CmP, h.CmPUpr,  
    h.Firma, h.Jmeno, h.Ulice, h.PSC, h.Obec, h.ICO, h.DIC, h.ICDPH, h.RelTypDIC, 
    h.Email, h.Tel, h.GSM,  
    h.Firma2, h.Jmeno2, h.Ulice2, h.PSC2, h.Obec2, z.IDS as Zeme, h.Tel2, h.Email2, h.Pozn,
    i.SText, i.Pozn, i.Kod, i.Mnozstvi, i.MJ, i.KcJedn, i.Sleva, i.RelSzDPH, 
    i.ProcentoDPH, i.SDph, i.Kc, i.KcDPH, i.CmJedn, i.Cm, i.CmDPH, i.JCbezDPH, 
    i.CmKurs, i.CmMnoz, i.KcKRozd, i.DatCreate, i.OrderFld
FROM 
    StwPh_11836547.dbo.FA h
INNER JOIN 
    StwPh_11836547.dbo.Fapol i ON i.RefAg = h.ID
INNER JOIN
    StwPh_11836547.dbo.sZeme z on h.refZeme2 = z.ID
WHERE h.Cislo = @param
ORDER BY 
    h.ID DESC;