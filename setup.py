from setuptools import find_packages, setup

with open("README.md", "r") as fh:
    long_description = fh.read()

setup(
    name='jupyter-videochat',
    version='0.1.1',
    url="https://github.com/yuvipanda/jupyter-videochat",
    author="Yuvi Panda",
    description="Video Chat with peers inside JupyterLab",
    packages=find_packages(),
    python_requires=">=3.6",
    install_requires=[
        "jupyterlab ==2.*",
        "escapism"
    ],
    zip_safe=False,
    include_package_data=True,
    license="BSD-3-Clause",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "JupyterLab"],
    classifiers=[
        "License :: OSI Approved :: BSD License",
        "Programming Language :: Python :: 3",
        "Framework :: Jupyter",
    ],
    data_files=[
        ("etc/jupyter/jupyter_notebook_config.d", ["jupyter-config/jupyter_videochat.json"])
    ]
)
