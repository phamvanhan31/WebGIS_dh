CREATE SEQUENCE qn_diemquantrac_seq;
ALTER TABLE qn_diemquantrac_seq OWNER TO postgres;
GRANT ALL ON TABLE qn_diemquantrac_seq TO postgres;
GRANT ALL ON TABLE qn_diemquantrac_seq TO public;

CREATE TABLE qn_diemquantrac
(
  gid integer NOT NULL DEFAULT nextval('qn_diemquantrac_seq'::regclass),
  ten character varying(30),
  thongso1 numeric,
  thongso2 numeric,
  thoidiem date,
  the_geom geometry,
  CONSTRAINT qn_diemquantrac_pkey PRIMARY KEY (gid),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 97620)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE qn_diemquantrac OWNER TO postgres;
GRANT ALL ON TABLE qn_diemquantrac TO postgres;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE qn_diemquantrac TO mtqn;

CREATE INDEX qn_diemquantrac_the_geom_gist
  ON qn_diemquantrac
  USING gist
  (the_geom);

INSERT INTO "geometry_columns"
VALUES ('','public','qn_diemquantrac','the_geom',2,97620,'POINT');
---------------------------------------------
---------------------------------------------

CREATE SEQUENCE qn_doituongthai_seq;
ALTER TABLE qn_doituongthai_seq OWNER TO postgres;
GRANT ALL ON TABLE qn_doituongthai_seq TO postgres;
GRANT ALL ON TABLE qn_doituongthai_seq TO public;

CREATE TABLE qn_doituongthai
(
  gid integer NOT NULL DEFAULT nextval('qn_doituongthai_seq'::regclass),
  ten character varying(30),
  diachi character varying,
  luongthai1 numeric,
  luongthai2 numeric,
  thoidiem date,
  the_geom geometry,
  CONSTRAINT qn_doituongthai_pkey PRIMARY KEY (gid),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'POLYGON'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 97620)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE qn_doituongthai OWNER TO postgres;
GRANT ALL ON TABLE qn_doituongthai TO postgres;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE qn_doituongthai TO mtqn;

CREATE INDEX qn_doituongthai_the_geom_gist
  ON qn_doituongthai
  USING gist
  (the_geom);

INSERT INTO "geometry_columns"
VALUES ('','public','qn_doituongthai','the_geom',2,97620,'POLYGON');
------------------------------------------------
--ADDING DATA
------------------------------------------------
INSERT INTO qn_diemquantrac (ten, thongso1, thongso2, thoidiem, the_geom)
VALUES ('D1',100,102,'12/1/2012', ST_GeomFromText('POINT(427097 2318760)',97620));
INSERT INTO qn_diemquantrac (ten, thongso1, thongso2, thoidiem, the_geom)
VALUES ('D2',100,102,'12/1/2012', ST_GeomFromText('POINT(427334 2319079)',97620));
INSERT INTO qn_diemquantrac (ten, thongso1, thongso2, thoidiem, the_geom)
VALUES ('D3',150,82,'10/09/2011', ST_GeomFromText('POINT(427608 2318373)',97620));


INSERT INTO qn_doituongthai (ten, diachi, luongthai1, luongthai2, thoidiem, the_geom)
VALUES ('Nhà máy 1','120 Trần Phú',82,49,'8/15/2012', ST_GeomFromText('POLYGON((427318 2318505, 427518 2318505, 427518 2318205, 427318 2318205, 427318 2318505))',97620));
